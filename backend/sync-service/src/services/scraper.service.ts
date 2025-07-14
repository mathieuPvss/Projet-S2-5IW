import axios from "axios";
import { Content } from "../interfaces/content.interface";
import { ScrapeConfig } from "../index";

interface ScrapeResult {
  [key: string]: any;
}

interface ScrapeResponse {
  success: boolean;
  startUrl: string;
  totalResults: number;
  results: ScrapeResult[];
  timestamp: string;
}

export class ScraperService {
  private readonly scraperServiceUrl: string;

  constructor() {
    this.scraperServiceUrl =
      process.env.SCRAPER_SERVICE_URL || "http://scraping-service:3001";
  }

  async scrapeContent(
    sourceName: string,
    config: ScrapeConfig
  ): Promise<Content[]> {
    try {
      console.log(
        `🔍 Début du scraping pour: ${sourceName} - ${config.startUrl}`
      );

      const response = await axios.post<ScrapeResponse>(
        `${this.scraperServiceUrl}/api/scrape`,
        config,
        {
          timeout: 18000000, // 5h de timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(`Échec du scraping: ${response.data}`);
      }

      const contents: Content[] = response.data.results.map((result, index) => {
        // Construire le titre à partir des champs scrapés ou utiliser une valeur par défaut
        const title =
          result.title ||
          result.name ||
          result.heading ||
          `Contenu ${index + 1}`;

        // Construire la description à partir des champs scrapés
        const description =
          result.description ||
          result.content ||
          result.text ||
          JSON.stringify(result);

        // Extraire les tags si disponibles
        const tags = result.tags
          ? Array.isArray(result.tags)
            ? result.tags
            : [result.tags]
          : [];

        const content: Content = {
          source: sourceName,
          source_id: config.startUrl,
          url: result.url || config.startUrl,
          title: String(title).substring(0, 255), // Limiter la taille du titre
          description: String(description).substring(0, 1000), // Limiter la taille de la description
          thumbnail: "",
          channel: "",
          published_at: result.publishDate || "",
          language: "",
          tags: tags,
          origin_question: "",
          created_at: new Date().toISOString(),
        };

        return content;
      });

      console.log(
        `✅ Scraping terminé: ${contents.length} éléments extraits de ${config.startUrl}`
      );
      return contents;
    } catch (error) {
      console.error(`❌ Erreur lors du scraping de ${config.startUrl}:`, error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          throw new Error("Service de scraping non disponible");
        } else if (error.response?.status === 400) {
          throw new Error(
            `Configuration de scraping invalide: ${
              error.response.data?.details || error.message
            }`
          );
        } else if (error.response?.status === 500) {
          throw new Error(
            `Erreur du service de scraping: ${
              error.response.data?.message || error.message
            }`
          );
        }
      }

      throw error;
    }
  }
}
