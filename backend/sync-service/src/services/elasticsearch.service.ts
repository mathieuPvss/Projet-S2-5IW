import { Client } from "@elastic/elasticsearch";
import { Content } from "../interfaces/content.interface";

export class ElasticsearchService {
  private client: Client;
  private readonly index = "contents";

  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_HOSTS || "http://elasticsearch:9200",
    });
  }

  async indexContent(content: Content): Promise<void> {
    try {
      await this.client.index({
        index: this.index,
        document: content,
      });
      console.log(`Document indexé avec succès: ${content.title}`);
    } catch (error) {
      console.error("Erreur lors de l'indexation:", error);
      throw error;
    }
  }

  async indexBulkContent(contents: Content[]): Promise<void> {
    try {
      const operations = contents.flatMap((content) => [
        { index: { _index: this.index } },
        content,
      ]);

      const response = await this.client.bulk({
        refresh: true,
        operations,
      });

      if (response.errors) {
        console.error(
          "Erreurs lors de l'indexation en masse:",
          response.errors
        );
        throw new Error("Erreurs lors de l'indexation en masse");
      }

      console.log(`${contents.length} documents indexés avec succès`);
    } catch (error) {
      console.error("Erreur lors de l'indexation en masse:", error);
      throw error;
    }
  }

  //   async searchContent(query: string): Promise<Content[]> {
  //     try {
  //       const response = await this.client.search<Content>({
  //         index: this.index,
  //         query: {
  //           multi_match: {
  //             query,
  //             fields: ["title", "description", "origin_question"],
  //           },
  //         },
  //       });

  //       return response.hits.hits.map((hit) => hit._source as Content);
  //     } catch (error) {
  //       console.error("Erreur lors de la recherche:", error);
  //       throw error;
  //     }
  //   }

  //   async deleteContent(contentId: string): Promise<void> {
  //     try {
  //       await this.client.delete({
  //         index: this.index,
  //         id: contentId,
  //       });
  //       console.log(`Document supprimé avec succès: ${contentId}`);
  //     } catch (error) {
  //       console.error("Erreur lors de la suppression:", error);
  //       throw error;
  //     }
  //   }
}
