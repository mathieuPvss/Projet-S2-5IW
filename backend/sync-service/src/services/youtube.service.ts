import { google } from "googleapis";

export class YouTubeService {
  private youtube;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.youtube = google.youtube({
      version: "v3",
      auth: this.apiKey,
    });
  }

  async searchVideos(query: string): Promise<any[]> {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        maxResults: 50,
        q: query,
        relevanceLanguage: "fr",
        type: ["video"],
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map((item) => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title,
        description: item.snippet?.description,
        publishedAt: item.snippet?.publishedAt,
        channelTitle: item.snippet?.channelTitle,
        thumbnails: item.snippet?.thumbnails?.default?.url,
      }));
    } catch (error) {
      console.error("Erreur lors de la recherche YouTube:", error);
      throw error;
    }
  }
}
