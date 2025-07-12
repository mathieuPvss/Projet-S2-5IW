import cron from "node-cron";
import { Pool } from "pg";
import { ElasticsearchService } from "./services/elasticsearch.service";
import { YouTubeService } from "./services/youtube.service";
import { Content } from "./interfaces/content.interface";
import { TiktokService } from "./services/tiktok.service";
import { ScraperService } from "./services/scraper.service";
import { startMetricsServer } from "./server";
import {
  syncOperationsCounter,
  syncDurationHistogram,
  pendingQuestionsGauge,
  youtubeApiCallsGauge,
  indexedContentsCounter,
  errorCounter,
} from "./services/metrics.service";

export interface ScrapeConfig {
  startUrl: string;

  followLinks?: {
    selector: string;
    limit?: number;
  };

  scrapeFields: {
    [fieldName: string]: string;
  };

  nextPageSelector?: string;

  maxPages?: number;
}

// Configuration de la connexion à la base de données
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

const elasticsearchService = new ElasticsearchService();
const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY || "");
const tiktokService = new TiktokService();
const scraperService = new ScraperService();

// Constantes
const YOUTUBE_DAILY_LIMIT = 100;
let youtubeApiCallCount = 0;

// Fonction pour mettre à jour le statut d'une question_usage
async function updateQuestionUsageStatus(
  questionId: string,
  sourceId: string,
  status: "success" | "error",
  reason?: string
): Promise<void> {
  try {
    const questionUsageResult = await pool.query<{ id: string }>(
      "SELECT id FROM question_usage WHERE question_id = $1 AND content_source_id = $2 AND status = 'pending' LIMIT 1",
      [questionId, sourceId]
    );

    if (questionUsageResult.rows.length > 0) {
      const questionUsageId = questionUsageResult.rows[0].id;
      await pool.query(
        "UPDATE question_usage SET status = $1, used_at = NOW() WHERE id = $2",
        [status, questionUsageId]
      );
      console.log(
        `Question usage ${questionUsageId} mise à jour en ${status}${
          reason ? ` - ${reason}` : ""
        }`
      );

      // Mise à jour des métriques
      syncOperationsCounter.inc({
        operation_type: "question_usage_update",
        source_type: "database",
        status,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    errorCounter.inc({
      error_type: "question_usage_update",
      source_type: "database",
    });
  }
}

// Traitement des questions pour YouTube
async function processYouTubeQuestions(
  questions: Array<{ id: string; content: string; technologie: string }>,
  sourceId: string
): Promise<void> {
  const timer = syncDurationHistogram.startTimer({
    operation_type: "youtube_questions",
    source_type: "youtube",
  });

  for (const question of questions) {
    if (youtubeApiCallCount >= YOUTUBE_DAILY_LIMIT) {
      console.log("Limite quotidienne d'appels API YouTube atteinte");
      break;
    }

    try {
      youtubeApiCallCount++;
      youtubeApiCallsGauge.set(youtubeApiCallCount);

      console.log(
        `Recherche YouTube pour la question: ${question.content} de la technologie: ${question.technologie} (Appel ${youtubeApiCallCount}/${YOUTUBE_DAILY_LIMIT})`
      );

      const videos = await youtubeService.searchVideos(
        question.content + " " + question.technologie
      );

      if (videos.length > 0) {
        for (const video of videos) {
          const content: Content = {
            source: "youtube",
            source_id: video.videoId,
            url: `https://www.youtube.com/watch?v=${video.videoId}`,
            title: video.title,
            description: video.description || "",
            thumbnail: video.thumbnails || "",
            channel: video.channelTitle,
            published_at: video.publishedAt,
            language: question.technologie,
            tags: [],
            origin_question: question.content,
            created_at: new Date().toISOString(),
          };

          await elasticsearchService.indexContent(content);
          indexedContentsCounter.inc({ source_type: "youtube" });
        }
        await updateQuestionUsageStatus(question.id, sourceId, "success");
        syncOperationsCounter.inc({
          operation_type: "youtube_search",
          source_type: "youtube",
          status: "success",
        });
      } else {
        await updateQuestionUsageStatus(
          question.id,
          sourceId,
          "error",
          "Aucune vidéo trouvée"
        );
        syncOperationsCounter.inc({
          operation_type: "youtube_search",
          source_type: "youtube",
          status: "error",
        });
      }
    } catch (error) {
      console.error(
        `Erreur lors du traitement de la question "${question.content}":`,
        error
      );
      await updateQuestionUsageStatus(
        question.id,
        sourceId,
        "error",
        "Erreur technique"
      );
      errorCounter.inc({
        error_type: "youtube_search",
        source_type: "youtube",
      });
    }
  }

  timer();
}

async function processTiktokQuestions(
  technologies: Array<{
    technologie: string;
  }>,
  sourceId: string
): Promise<void> {
  const timer = syncDurationHistogram.startTimer({
    operation_type: "tiktok_questions",
    source_type: "tiktok",
  });

  for (const techno of technologies) {
    console.log(
      `Traitement de la technologie: ${techno.technologie} pour tiktok`
    );
    const questionsIds = await pool.query<{ id: string }>(
      "SELECT id FROM question WHERE technologie = $1",
      [techno.technologie]
    );
    try {
      const tiktokContents = await tiktokService.searchContent(
        techno.technologie
      );

      if (tiktokContents.length > 0) {
        for (const content of tiktokContents) {
          await elasticsearchService.indexContent(content);
          indexedContentsCounter.inc({ source_type: "tiktok" });
        }

        for (const questionId of questionsIds.rows) {
          await updateQuestionUsageStatus(questionId.id, sourceId, "success");
        }
        syncOperationsCounter.inc({
          operation_type: "tiktok_search",
          source_type: "tiktok",
          status: "success",
        });
      } else {
        for (const questionId of questionsIds.rows) {
          await updateQuestionUsageStatus(questionId.id, sourceId, "error");
        }
        syncOperationsCounter.inc({
          operation_type: "tiktok_search",
          source_type: "tiktok",
          status: "error",
        });
      }
    } catch (error) {
      console.error(
        `Erreur lors du traitement de la technologie "${techno.technologie} pour tiktok":`,
        error
      );
      for (const questionId of questionsIds.rows) {
        await updateQuestionUsageStatus(questionId.id, sourceId, "error");
      }
      errorCounter.inc({ error_type: "tiktok_search", source_type: "tiktok" });
    }
  }

  timer();
}

async function processScraper(
  sourceId: string,
  sourceName: string,
  sourceConfig: ScrapeConfig
): Promise<void> {
  const timer = syncDurationHistogram.startTimer({
    operation_type: "scraper",
    source_type: "scraper",
  });

  try {
    let newContents = await scraperService.scrapeContent(
      sourceName,
      sourceConfig
    );
    if (newContents.length > 0) {
      await elasticsearchService.indexBulkContent(newContents);
      indexedContentsCounter.inc(
        { source_type: "scraper" },
        newContents.length
      );

      await pool.query(
        "UPDATE content_source SET enabled = false WHERE id = $1",
        [sourceId]
      );
      syncOperationsCounter.inc({
        operation_type: "scraper",
        source_type: "scraper",
        status: "success",
      });
    } else {
      syncOperationsCounter.inc({
        operation_type: "scraper",
        source_type: "scraper",
        status: "error",
      });
    }
  } catch (error) {
    console.error(
      `Erreur lors du traitement de la source "${sourceName}":`,
      error
    );
    errorCounter.inc({ error_type: "scraper", source_type: "scraper" });
  }

  timer();
}

// Fonction principale de synchronisation
async function syncContent(): Promise<void> {
  console.log("Début de la synchronisation...");
  const timer = syncDurationHistogram.startTimer({
    operation_type: "sync_content",
    source_type: "all",
  });

  try {
    // Récupération des content sources
    const contentSourcesResult = await pool.query<{
      id: string;
      enabled: boolean;
      name: string;
      type: "scraper" | "api";
      config: ScrapeConfig | null;
    }>("SELECT * FROM content_source");

    // Récupération des questions en attente (max 10 par technologie)
    const questionsResultForYoutube = await pool.query<{
      id: string;
      content: string;
      technologie: string;
    }>(`
      WITH RankedQuestions AS (
        SELECT 
          q.id,
          q.content,
          q.technologie,
          ROW_NUMBER() OVER (PARTITION BY q.technologie ORDER BY q.id) as rn
        FROM question q
        INNER JOIN question_usage qu ON q.id = qu.question_id
        WHERE qu.status = 'pending'
      )
      SELECT id, content, technologie
      FROM RankedQuestions
      WHERE rn <= 10
    `);

    const questionsResultForTiktok = await pool.query<{
      technologie: string;
    }>(`
      SELECT DISTINCT q.technologie
      FROM question_usage qu
      JOIN question q ON qu.question_id = q.id
      JOIN content_source cs ON qu.content_source_id = cs.id
      WHERE cs.name = 'tiktok'
      AND qu.status = 'pending'
      GROUP BY q.technologie
      `);

    // Mise à jour des métriques pour les questions en attente
    pendingQuestionsGauge.set(
      { source_type: "youtube" },
      questionsResultForYoutube.rows.length
    );
    pendingQuestionsGauge.set(
      { source_type: "tiktok" },
      questionsResultForTiktok.rows.length
    );

    // Traitement par source
    for (const source of contentSourcesResult.rows) {
      console.log(`Traitement de la source: ${source.name}`);

      switch (source.type) {
        case "scraper":
          if (source.enabled && source.config) {
            await processScraper(source.id, source.name, source.config);
          }
          break;
        case "api":
          switch (source.name) {
            case "youtube":
              if (source.enabled) {
                console.log("youtube test");
                // await processYouTubeQuestions(
                //   questionsResultForYoutube.rows,
                //   source.id
                // );
                console.log("youtube test 2");
              }
              break;
            case "tiktok":
              if (source.enabled) {
                console.log("tiktok test");
                // await processTiktokQuestions(
                //   questionsResultForTiktok.rows,
                //   source.id
                // );
                console.log("tiktok test 2");
              }
              break;
            default:
              console.log(`Source non prise en charge: ${source.name}`);
          }
          break;
        default:
          console.log(`Source type non prise en charge: ${source.name}`);
      }
    }

    console.log("Synchronisation terminée");
    syncOperationsCounter.inc({
      operation_type: "sync_content",
      source_type: "all",
      status: "success",
    });
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    errorCounter.inc({ error_type: "sync_content", source_type: "all" });
  }

  timer();
}

// Planification de la tâche (tous les jours à minuit)
// Réinitialisation du compteur YouTube à minuit

// Exécution de la synchronisation tous les jours à 18h00
cron.schedule("0 18 * * *", () => {
  youtubeApiCallCount = 0;
  youtubeApiCallsGauge.set(youtubeApiCallCount);
  console.log(
    "Compteur d'appels API YouTube réinitialisé : ",
    youtubeApiCallCount
  );
  console.log("Lancement de la synchronisation programmée");
  syncContent();
});

// Fonction d'initialisation
async function initializeService(): Promise<void> {
  try {
    // Démarrage du serveur de métriques
    await startMetricsServer();

    // Initialisation des métriques
    youtubeApiCallsGauge.set(youtubeApiCallCount);

    console.log("Service de synchronisation démarré");

    // Première exécution au démarrage
    await syncContent();
  } catch (error) {
    console.error("Erreur lors de l'initialisation du service:", error);
    process.exit(1);
  }
}

// Lancement du service
initializeService();
