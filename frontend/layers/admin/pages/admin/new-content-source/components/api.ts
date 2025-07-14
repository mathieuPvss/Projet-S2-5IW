import { useAuthStore } from "@/stores/auth";

interface ContentSource {
  id: string;
  name: string;
  enabled: boolean;
  type: "scraper" | "api";
  config: ScrapeConfig | null;
}

interface ScrapeConfig {
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

interface CreateContentSourceDto {
  name: string;
  enabled: boolean;
  type: "scraper";
  config: ScrapeConfig;
}

interface UpdateContentSourceDto {
  name?: string;
  enabled?: boolean;
  type?: "scraper";
  config?: ScrapeConfig;
}

interface TestScrapingResponse {
  success: boolean;
  startUrl: string;
  totalResults: number;
  results: any[];
  timestamp: string;
}

export class Api {
  private static getBaseHeaders() {
    const auth = useAuthStore();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    };
  }

  private static getBaseUrl() {
    return useRuntimeConfig().public.nestBaseUrl;
  }

  static async getContentSources(): Promise<ContentSource[]> {
    const response = await fetch(`${this.getBaseUrl()}/api/content-sources`, {
      method: "GET",
      headers: this.getBaseHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async createContentSource(
    data: CreateContentSourceDto,
  ): Promise<ContentSource> {
    const response = await fetch(`${this.getBaseUrl()}/api/content-sources`, {
      method: "POST",
      headers: this.getBaseHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async updateContentSource(
    id: string,
    data: UpdateContentSourceDto,
  ): Promise<ContentSource> {
    const response = await fetch(
      `${this.getBaseUrl()}/api/content-sources/${id}`,
      {
        method: "PATCH",
        headers: this.getBaseHeaders(),
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async deleteContentSource(id: string): Promise<void> {
    const response = await fetch(
      `${this.getBaseUrl()}/api/content-sources/${id}`,
      {
        method: "DELETE",
        headers: this.getBaseHeaders(),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }
  }

  static async testScrapingConfig(
    config: ScrapeConfig,
  ): Promise<TestScrapingResponse> {
    // Appel au service de scraping
    const scrapingServiceUrl = useRuntimeConfig().public.scrapingServiceUrl;

    const response = await fetch(`${scrapingServiceUrl}/api/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || error.message || `Erreur HTTP ${response.status}`,
      );
    }

    return await response.json();
  }
}
