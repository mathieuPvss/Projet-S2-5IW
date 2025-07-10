import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Client } from "@elastic/elasticsearch";

// Configuration Elasticsearch (adapter l'URL si besoin)
const client = new Client({
  node: process.env.ELASTICSEARCH_HOSTS || "http://localhost:9200",
});

export const searchElasticsearch = tool(
  async ({ question }) => {
    try {
      console.log("🔎 Recherche Elasticsearch avec les mots-clés :", question);

      const result = await client.search({
        index: "contents",
        body: {
          query: {
            multi_match: {
              query: question,
              fields: [
                "title^3",
                "description",
                "tags",
                "origin_question",
                "language",
              ],
              fuzziness: "AUTO",
            },
          },
          size: 50,
          sort: [{ _score: { order: "desc" } }],
        },
      });

      console.log(
        `📊 Nombre de résultats trouvés : ${result.hits?.hits?.length || 0}`
      );
      if (result.hits?.hits?.length > 0) {
        console.log(`🏆 Meilleur score : ${result.hits.hits[0]._score}`);
        console.log(
          `🎬 Premier résultat : "${
            (result.hits.hits[0]._source as any)?.title
          }"`
        );
      }

      const videos = (result.hits?.hits || [])
        .map((hit) => {
          const src = hit._source as any;
          return {
            id: hit._id,
            score: hit._score,
            source: src.source,
            title: src.title,
            description: src.description,
            url: src.url,
            thumbnail: src.thumbnail,
            channel: src.channel,
            published_at: src.published_at,
            language: src.language,
            tags: src.tags,
          };
        })
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      return {
        content: {
          texte: videos.length
            ? "Voici ce que j'ai trouvé pour ta recherche ! 🎬"
            : "Désolé, je n'ai trouvé aucune vidéo correspondante. 😢",
          videos,
        },
      };
    } catch (error) {
      console.error("Erreur Elasticsearch:", error);
      return {
        texte: "Erreur lors de la recherche dans Elasticsearch.",
        videos: [],
      };
    }
  },
  {
    name: "search_elasticsearch",
    description:
      "Recherche des vidéos dans Elasticsearch à partir d'une question ou de mots-clés.",
    schema: z.object({
      question: z
        .string()
        .describe("La question ou les mots-clés pour la recherche vidéo."),
    }),
  }
);
