import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
  temperature: 0.1,
  model: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
});

export const translateQuestion = tool(
  async ({ userQuestion }) => {
    try {
      console.log("🔍 Question originale :", userQuestion);

      const prompt = `
Tu es un expert en recherche de contenu vidéo. Ta mission est de transformer la question de l'utilisateur en mots-clés optimisés pour une recherche dans une base de données elasticsearch.

Règles importantes :
- Extrais les concepts clés et mots-clés techniques
- Supprime les mots de liaison inutiles (comment, faire, etc.)
- Garde les termes techniques précis
- Retourne une chaîne de mots-clés séparés par des espaces
- Maximum 5-8 mots-clés

Exemples :
- "Comment faire un array en C ?" → "array C programmation"
- "Je veux apprendre les boucles en Python" → "boucles Python programmation"
- "Tutoriel sur les fonctions JavaScript" → "fonctions JavaScript tutoriel"

Question utilisateur : "${userQuestion}"

Mots-clés optimisés :`;

      const response = await llm.invoke(prompt);
      const translatedKeywords = response.content.toString().trim();

      console.log("🎯 Mots-clés traduits :", translatedKeywords);

      return translatedKeywords;
    } catch (error) {
      console.error("Erreur traduction question:", error);
      return userQuestion; // Fallback sur la question originale
    }
  },
  {
    name: "translate_question",
    description:
      "Traduit et optimise la question de l'utilisateur en mots-clés pour la recherche vidéo.",
    schema: z.object({
      userQuestion: z
        .string()
        .describe(
          "La question originale de l'utilisateur à traduire/optimiser."
        ),
    }),
  }
);
