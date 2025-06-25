import { ApifyClient } from "apify-client";
import { Content } from "../interfaces/content.interface";

export class TiktokService {
  private readonly apifyClient: ApifyClient;
  private readonly actorId = "apify/google-search-scraper";

  constructor() {
    // Initialisation du client Apify avec la clé API
    this.apifyClient = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });
  }

  async searchContent(technology: string): Promise<Content[]> {
    try {
      // Configuration de l'input pour l'actor Google Search Scraper
      const input = {
        countryCode: "fr",
        focusOnPaidAds: false,
        forceExactMatch: false,
        includeIcons: false,
        includeUnfilteredResults: false,
        languageCode: "fr",
        maxPagesPerQuery: 1,
        mobileResults: false,
        queries: `${technology} programmation`,
        resultsPerPage: 100,
        saveHtml: false,
        saveHtmlToKeyValueStore: true,
        searchLanguage: "fr",
        site: "tiktok.com",
      };

      // Lancement de l'actor
      const run = await this.apifyClient
        .actor("apify/google-search-scraper")
        .call(input);

      // Récupération des résultats
      const { items } = await this.apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();
      const itemsResult = items as any;

      // Transformation des résultats en format Content et verifie si c'est une video tiktok
      return itemsResult[0].organicResults
        .filter((item: any) => item.url.includes("/video/"))
        .map((item: any) => {
          return {
            source: "tiktok",
            source_id: this.extractTikTokId(item.url) || "",
            url: item.url,
            title: item.title || "",
            description: item.description || "",
            thumbnail: "",
            channel: this.extractChannelFromUrl(item.url) || "",
            published_at: new Date().toISOString(),
            language: technology,
            tags: [technology, "programmation"],
            origin_question: `${technology} programmation`,
            created_at: new Date().toISOString(),
          };
        });
    } catch (error) {
      console.error("Erreur lors de la recherche TikTok:", error);
      throw new Error("Échec de la recherche de contenu TikTok");
    }
  }

  private extractTikTokId(url: string): string | null {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  private extractChannelFromUrl(url: string): string | null {
    const match = url.match(/@([^/]+)/);
    return match ? match[1] : null;
  }
}
