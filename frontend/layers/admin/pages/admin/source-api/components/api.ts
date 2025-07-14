import { useAuthStore } from "@/stores/auth";

interface CreateQuestionWithUsagesDto {
  technologie: string;
  category: string;
  content: string;
  createUsages?: boolean;
}

interface CreateQuestionWithUsagesResponse {
  question: {
    id: string;
    technologie: string;
    category: string;
    content: string;
  };
  usagesCreated: number;
}

interface ImportQuestionsResponse {
  questionsCreated: number;
  usagesCreated: number;
  errors: string[];
}

interface ContentSourcesStats {
  total: number;
  api: number;
  scraper: number;
  enabled: number;
  disabled: number;
}

export class Api {
  static async createQuestionWithUsages(
    data: CreateQuestionWithUsagesDto,
  ): Promise<CreateQuestionWithUsagesResponse> {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    //add token to headers
    const auth = useAuthStore();
    const response = await fetch(`${nestUrl}/api/questions/with-usages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async importQuestionsFromCSV(
    file: File,
  ): Promise<ImportQuestionsResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(`${nestUrl}/api/questions/import-csv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async getQuestions(): Promise<any[]> {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(`${nestUrl}/api/questions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async getQuestionsCount(): Promise<{ count: number }> {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(`${nestUrl}/api/questions/count`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  static async getContentSourcesStats(): Promise<ContentSourcesStats> {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(`${nestUrl}/api/content-sources/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }
}
