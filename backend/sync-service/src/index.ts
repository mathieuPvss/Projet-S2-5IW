import cron from "node-cron";
import { Pool } from "pg";
import { ElasticsearchService } from "./services/elasticsearch.service";
import { YouTubeService } from "./services/youtube.service";
import { Content } from "./interfaces/content.interface";

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

// Constantes
const YOUTUBE_DAILY_LIMIT = 100;
let youtubeApiCallCount = 0;

// Fonction pour mettre à jour le statut d'une question_usage
async function updateQuestionUsageStatus(
  questionId: number,
  sourceId: number,
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
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
  }
}

// Traitement des questions pour YouTube
async function processYouTubeQuestions(
  questions: Array<{ id: number; content: string; technologie: string }>,
  sourceId: number
): Promise<void> {
  for (const question of questions) {
    if (youtubeApiCallCount >= YOUTUBE_DAILY_LIMIT) {
      console.log("Limite quotidienne d'appels API YouTube atteinte");
      break;
    }

    try {
      youtubeApiCallCount++;
      console.log(
        `Recherche YouTube pour la question: ${question.content} (Appel ${youtubeApiCallCount}/${YOUTUBE_DAILY_LIMIT})`
      );

      const videos = await youtubeService.searchVideos(question.content);

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
        }
        await updateQuestionUsageStatus(question.id, sourceId, "success");
      } else {
        await updateQuestionUsageStatus(
          question.id,
          sourceId,
          "error",
          "Aucune vidéo trouvée"
        );
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
    }
  }
}

// Fonction principale de synchronisation
async function syncContent(): Promise<void> {
  console.log("Début de la synchronisation...");

  try {
    // Récupération des content sources
    const contentSourcesResult = await pool.query<{
      id: number;
      name: string;
      type: string;
    }>("SELECT * FROM content_source");

    // Récupération des questions en attente (max 10 par technologie)
    const questionsResult = await pool.query<{
      id: number;
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

    // Traitement par source
    for (const source of contentSourcesResult.rows) {
      console.log(`Traitement de la source: ${source.name}`);

      switch (source.name) {
        case "youtube":
          await processYouTubeQuestions(questionsResult.rows, source.id);
          break;
        // Ajouter d'autres sources ici
        default:
          console.log(`Source non prise en charge: ${source.name}`);
      }
    }

    console.log("Synchronisation terminée");
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
  }
}

// Planification de la tâche (tous les jours à minuit)
// Réinitialisation du compteur YouTube à minuit

// Exécution de la synchronisation toutes les 2 minutes
cron.schedule("*/2 * * * *", () => {
  youtubeApiCallCount = 0;
  console.log(
    "Compteur d'appels API YouTube réinitialisé : ",
    youtubeApiCallCount
  );
  console.log("Lancement de la synchronisation programmée");
  syncContent();
  youtubeApiCallCount++;
  console.log("Compteur d'appels API YouTube : ", youtubeApiCallCount);
});

// Première exécution au démarrage
console.log("Service de synchronisation démarré");
syncContent();

// todo :
// - ajouter les tags
