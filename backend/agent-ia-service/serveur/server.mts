#!/usr/bin/env node

import { HumanMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { getAgent, getAgentsMetadata } from "./agents-registry.mts";
import jwt from "jsonwebtoken";
import { metricsMiddleware } from "./middleware/metrics.middleware.mts";
import {
  getMetrics,
  incrementAgentOperation,
  recordAgentDuration,
  incrementStreamingSession,
  decrementStreamingSession,
  incrementStreamingEvent,
  recordStreamingDuration,
  incrementConversationOperation,
  setActiveConversations,
  recordConversationMessages,
  incrementToolExecution,
  recordToolDuration,
  incrementAgentError,
} from "./metrics.service.mts";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types
interface AgentConfig {
  id: string;
  name: string;
  description: string;
}

interface UserInput {
  message: string;
  thread_id?: string;
  conversation_id?: string;
  chat_id?: string;
  context?: any;
  details?: any;
}

interface AgentResponse {
  content: string;
  thread_id: string;
  run_id: string;
}

interface ChatMessage {
  type: "human" | "ai" | "tool";
  content: string;
  timestamp: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

interface ConversationState {
  thread_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

// Configuration
const API_VERSION = "1.0.0";
const API_TITLE = "Agent CLI Server";
const API_DESCRIPTION = "Serveur Express.js pour le CLI des agents IA";
const PORT = process.env.AGENT_AI_PORT || 8080;

// In-memory storage (replace with real database in production)
const conversations: Map<string, ConversationState> = new Map();
const activeGenerations: Map<string, boolean> = new Map();

// Load agents configuration - utilise maintenant le registre d'agents
async function loadAgentsConfig(): Promise<AgentConfig[]> {
  try {
    // Récupération des métadonnées depuis le registre
    const agents = getAgentsMetadata();
    console.log(
      `✅ ${agents.length} agent(s) chargé(s) depuis le registre:`,
      agents.map((a) => a.id).join(", ")
    );
    return agents;
  } catch (error) {
    console.warn(
      "⚠️ Erreur lors du chargement des agents depuis le registre:",
      error
    );
    return [];
  }
}

// Middleware de gestion des erreurs
function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Erreur serveur:", err);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: err.message,
    path: req.path,
  });
}

// Utilitaires pour les conversations
function getOrCreateConversation(threadId: string): ConversationState {
  if (!conversations.has(threadId)) {
    const now = new Date().toISOString();
    conversations.set(threadId, {
      thread_id: threadId,
      messages: [],
      created_at: now,
      updated_at: now,
    });
  }
  return conversations.get(threadId)!;
}

function addMessageToConversation(threadId: string, message: ChatMessage) {
  const conversation = getOrCreateConversation(threadId);
  conversation.messages.push(message);
  conversation.updated_at = new Date().toISOString();

  // Métriques de conversations
  setActiveConversations(conversations.size);
}

// Create Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.text());

// Middleware de métriques (avant les autres routes)
app.use(metricsMiddleware);

// Middleware d'authentification
function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload;
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).json({ message: "Token invalide" });
  }
}

// Route pour les métriques Prometheus (avant l'auth middleware)
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    const metrics = await getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des métriques:", error);
    res.status(500).send("Erreur interne du serveur");
  }
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const agents = await loadAgentsConfig();
    res.json({
      status: "ok",
      version: API_VERSION,
      title: API_TITLE,
      description: API_DESCRIPTION,
      timestamp: new Date().toISOString(),
      agents_count: agents.length,
      available_agents: agents.map((a) => a.id),
      components: {
        api: "healthy",
        agents: "healthy",
        database: "healthy", // Simulé
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la vérification de santé",
    });
  }
});

app.use(jwtAuthMiddleware);

app.get("/app/agents", async (req: Request, res: Response) => {
  try {
    const agents = await loadAgentsConfig();
    res.json(agents);
  } catch (error) {
    console.error("Erreur lors du chargement des agents:", error);
    res.status(500).json({
      error: "Erreur lors du chargement des agents",
      message: (error as Error).message,
    });
  }
});

app.post("/app/:agentId/invoke", async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const userInput: UserInput = req.body;
  const startTime = Date.now();

  try {
    console.log(
      `🤖 Invocation de l'agent ${agentId} pour le thread ${
        userInput.thread_id || "nouveau"
      }`
    );

    const threadId = userInput.thread_id || uuidv4();
    const runId = uuidv4();

    // Récupérer l'agent depuis le registre
    const agent = getAgent(agentId);

    // Ajouter le message utilisateur à la conversation
    addMessageToConversation(threadId, {
      type: "human",
      content: userInput.message,
      timestamp: new Date().toISOString(),
    });

    // Configuration pour l'agent
    const config: RunnableConfig = {
      configurable: { thread_id: threadId },
      runId: runId,
    };

    // Invoquer l'agent avec le message
    const input = {
      messages: [new HumanMessage({ content: userInput.message })],
    };
    const result = await agent.invoke(input, config);

    // Extraire la réponse
    const lastMessage = result.messages[result.messages.length - 1];
    const responseContent = lastMessage?.content || "Aucune réponse";

    // Ajouter la réponse de l'agent à la conversation
    addMessageToConversation(threadId, {
      type: "ai",
      content:
        typeof responseContent === "string"
          ? responseContent
          : JSON.stringify(responseContent),
      timestamp: new Date().toISOString(),
    });

    const agentResponse: AgentResponse = {
      content: responseContent,
      thread_id: threadId,
      run_id: runId,
    };

    // Métriques de succès
    const duration = (Date.now() - startTime) / 1000;
    recordAgentDuration(agentId, "invoke", "POST", duration);
    incrementAgentOperation(agentId, "invoke", "success", "POST");

    // Mettre à jour le nombre de conversations actives
    setActiveConversations(conversations.size);

    res.json(agentResponse);
  } catch (error) {
    console.error("❌ Erreur lors de l'invocation:", error);

    // Métriques d'erreur
    const duration = (Date.now() - startTime) / 1000;
    recordAgentDuration(agentId, "invoke", "POST", duration);
    incrementAgentOperation(agentId, "invoke", "error", "POST");
    incrementAgentError(
      agentId,
      "invoke",
      (error as Error).name || "unknown_error"
    );

    res.status(500).json({
      error: "Erreur lors de l'invocation de l'agent",
      message: (error as Error).message,
    });
  }
});

app.post("/app/:agentId/stream", async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const userInput: UserInput = req.body;
  const streamStartTime = Date.now();

  try {
    console.log(
      `🌊 Streaming avec l'agent ${agentId} pour le thread ${
        userInput.thread_id || "nouveau"
      }`
    );

    const threadId = userInput.thread_id || uuidv4();
    const runId = uuidv4();

    // Incrémenter les sessions de streaming actives
    incrementStreamingSession(agentId);

    // Récupérer l'agent depuis le registre
    const agent = getAgent(agentId);

    // Configuration SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Cache-Control");

    // Marquer la génération comme active
    activeGenerations.set(threadId, true);

    // Fonction pour envoyer des événements SSE
    const sendSSE = (event: string, data?: any) => {
      res.write(`event: ${event}\n`);
      if (data !== undefined) {
        res.write(`data: ${JSON.stringify(data)}\n`);
      }
      res.write("\n");

      // Compter les événements de streaming
      incrementStreamingEvent(agentId, event);
    };

    // Ajouter le message utilisateur à la conversation
    addMessageToConversation(threadId, {
      type: "human",
      content: userInput.message,
      timestamp: new Date().toISOString(),
    });

    // Commencer le streaming
    sendSSE("stream_start");

    try {
      // Configuration pour l'agent
      const config: RunnableConfig = {
        configurable: { thread_id: threadId },
        runId: runId,
      };

      const input = {
        messages: [new HumanMessage({ content: userInput.message })],
      };
      let fullResponse = "";

      try {
        // Utiliser le vrai streaming pour capturer les événements d'outils
        const stream = await agent.stream(input, config);

        for await (const chunk of stream) {
          if (!activeGenerations.get(threadId)) {
            break; // Génération arrêtée
          }

          console.log("📦 Chunk reçu:", JSON.stringify(chunk, null, 2));

          // Traiter les différents nœuds du graphe
          for (const [nodeName, nodeData] of Object.entries(chunk)) {
            if (nodeName === "__start__") continue;

            console.log(`🔄 Nœud: ${nodeName}`, nodeData);

            // Traiter les messages dans nodeData
            if (
              nodeData &&
              typeof nodeData === "object" &&
              "messages" in nodeData
            ) {
              const messages = (nodeData as any).messages || [];

              for (const message of messages) {
                // Détecter les appels d'outils
                if (message.tool_calls && Array.isArray(message.tool_calls)) {
                  for (const toolCall of message.tool_calls) {
                    sendSSE("tool_execution_start", {
                      name: toolCall.name,
                      params: toolCall.args || {},
                      id: toolCall.id,
                    });

                    // Métriques d'outils
                    incrementToolExecution(agentId, toolCall.name, "success");
                  }
                }

                // Détecter les résultats d'outils
                if (message.tool_call_id && message.content) {
                  sendSSE("tool_execution_complete", {
                    name: message.name || "tool",
                    output: message.content,
                    id: message.tool_call_id,
                  });
                }

                // Messages normaux de l'agent
                if (
                  message.content &&
                  !message.tool_call_id &&
                  nodeName === "agent"
                ) {
                  const content =
                    typeof message.content === "string"
                      ? message.content
                      : JSON.stringify(message.content);
                  fullResponse += content;

                  // Envoyer le contenu par petits chunks
                  const chunks = content.match(/.{1,10}/g) || [content];
                  for (const textChunk of chunks) {
                    sendSSE("stream_token", { token: textChunk });
                    await new Promise((resolve) => setTimeout(resolve, 20));
                  }
                }
              }
            }
          }
        }
      } catch (streamError) {
        console.error(
          "❌ Erreur pendant le streaming de l'agent:",
          streamError
        );
        sendSSE("tool_execution_error", {
          name: "agent_stream",
          error: (streamError as Error).message,
        });
        fullResponse = `Erreur lors du traitement de votre demande: ${
          (streamError as Error).message
        }`;
        sendSSE("stream_token", { token: fullResponse });
      }

      // Ajouter la réponse complète à la conversation
      if (fullResponse) {
        addMessageToConversation(threadId, {
          type: "ai",
          content: fullResponse,
          timestamp: new Date().toISOString(),
        });
      }

      // Terminer le streaming
      sendSSE("stream_end", { thread_id: threadId });

      // Métriques de succès
      const streamDuration = (Date.now() - streamStartTime) / 1000;
      recordStreamingDuration(agentId, streamDuration);
      incrementAgentOperation(agentId, "stream", "success", "POST");
    } catch (error) {
      console.error("❌ Erreur pendant le streaming:", error);
      sendSSE("error", (error as Error).message);

      // Métriques d'erreur
      const streamDuration = (Date.now() - streamStartTime) / 1000;
      recordStreamingDuration(agentId, streamDuration);
      incrementAgentOperation(agentId, "stream", "error", "POST");
      incrementAgentError(
        agentId,
        "stream",
        (error as Error).name || "unknown_error"
      );
    } finally {
      // Nettoyer
      activeGenerations.delete(threadId);
      decrementStreamingSession(agentId);
      setActiveConversations(conversations.size);
      res.end();
    }

    // Gérer la déconnexion du client
    req.on("close", () => {
      console.log(`🔌 Client déconnecté pour le thread ${threadId}`);
      activeGenerations.set(threadId, false);
    });
  } catch (error) {
    console.error("❌ Erreur lors du streaming:", error);

    // Métriques d'erreur
    const streamDuration = (Date.now() - streamStartTime) / 1000;
    recordStreamingDuration(agentId, streamDuration);
    incrementAgentOperation(agentId, "stream", "error", "POST");
    incrementAgentError(
      agentId,
      "stream",
      (error as Error).name || "unknown_error"
    );
    decrementStreamingSession(agentId);

    res.status(500).json({
      error: "Erreur lors du streaming avec l'agent",
      message: (error as Error).message,
    });
  }
});

app.post("/app/:agentId/stop", async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { thread_id } = req.body;

  try {
    console.log(
      `🛑 Arrêt de la génération pour l'agent ${agentId}, thread ${thread_id}`
    );

    if (thread_id && activeGenerations.has(thread_id)) {
      activeGenerations.set(thread_id, false);
      setTimeout(() => activeGenerations.delete(thread_id), 1000); // Nettoyer après 1 seconde

      // Métriques de succès
      incrementAgentOperation(agentId, "stop", "success", "POST");
      decrementStreamingSession(agentId);

      res.json({
        status: "success",
        message: "Génération arrêtée avec succès",
      });
    } else {
      // Métriques de succès (aucune génération active)
      incrementAgentOperation(agentId, "stop", "success", "POST");

      res.json({
        status: "success",
        message: "Aucune génération active à arrêter",
      });
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'arrêt:", error);

    // Métriques d'erreur
    incrementAgentOperation(agentId, "stop", "error", "POST");
    incrementAgentError(
      agentId,
      "stop",
      (error as Error).name || "unknown_error"
    );

    res.status(500).json({
      error: "Erreur lors de l'arrêt de la génération",
      message: (error as Error).message,
    });
  }
});

// Route pour obtenir l'historique d'une conversation
app.get("/app/conversations/:threadId", async (req: Request, res: Response) => {
  const { threadId } = req.params;

  try {
    const conversation = conversations.get(threadId);
    if (!conversation) {
      incrementConversationOperation("get_conversation", "error");
      return res.status(404).json({
        error: "Conversation non trouvée",
        message: `Aucune conversation trouvée pour le thread ${threadId}`,
      });
    }

    // Métriques de succès
    incrementConversationOperation("get_conversation", "success");
    recordConversationMessages(conversation.messages.length);

    res.json(conversation);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de la conversation:",
      error
    );

    // Métriques d'erreur
    incrementConversationOperation("get_conversation", "error");

    res.status(500).json({
      error: "Erreur lors de la récupération de la conversation",
      message: (error as Error).message,
    });
  }
});

// Route pour lister toutes les conversations
app.get("/app/conversations", async (req: Request, res: Response) => {
  try {
    const conversationList = Array.from(conversations.values()).map((conv) => ({
      thread_id: conv.thread_id,
      message_count: conv.messages.length,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      last_message:
        conv.messages[conv.messages.length - 1]?.content.slice(0, 100) ||
        "Aucun message",
    }));

    // Métriques de succès
    incrementConversationOperation("list_conversations", "success");
    setActiveConversations(conversations.size);

    res.json(conversationList);
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des conversations:",
      error
    );

    // Métriques d'erreur
    incrementConversationOperation("list_conversations", "error");

    res.status(500).json({
      error: "Erreur lors de la récupération des conversations",
      message: (error as Error).message,
    });
  }
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Gérer les routes non trouvées
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route non trouvée",
    message: `La route ${req.path} n'existe pas`,
    available_endpoints: [
      "GET /health",
      "GET /agents",
      "POST /:agentId/invoke",
      "POST /:agentId/stream",
      "POST /:agentId/stop",
      "GET /conversations",
      "GET /conversations/:threadId",
    ],
  });
});

// Démarrer le serveur
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log("🚀 Serveur Agent CLI démarré !");
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}/app`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🤖 Agents: http://localhost:${PORT}/app/agents`);
      console.log("");
      console.log("📚 Endpoints disponibles:");
      console.log("  GET  /health                     - Vérification de santé");
      console.log("  GET  /agents                     - Liste des agents");
      console.log(
        "  POST /app/:agentId/invoke            - Invocation directe"
      );
      console.log("  POST /app/:agentId/stream            - Streaming SSE");
      console.log(
        "  POST /app/:agentId/stop              - Arrêter la génération"
      );
      console.log(
        "  GET  /conversations              - Liste des conversations"
      );
      console.log(
        "  GET  /conversations/:threadId    - Détails d'une conversation"
      );
      console.log("");
      console.log("🔑 Variables d'environnement:");
      console.log(`  PORT=${PORT}`);
      console.log(
        `  REQUIRE_AUTH=${process.env.AGENT_AI_REQUIRE_AUTH || "true"}`
      );
      console.log("");
      console.log("💡 Pour tester avec le CLI:");
      console.log("  npm run cli check");
      console.log("  npm run cli chat");

      // Charger et afficher les agents disponibles
      loadAgentsConfig().then((agents) => {
        console.log("");
        console.log("🤖 Agents disponibles:");
        agents.forEach((agent) => {
          console.log(`  - ${agent.id}: ${agent.name}`);
          console.log(`    ${agent.description}`);
        });
      });
    });
  } catch (error) {
    console.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// Gérer l'arrêt propre du serveur
process.on("SIGTERM", () => {
  console.log("🛑 Arrêt du serveur...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Arrêt du serveur...");
  process.exit(0);
});

// Démarrer le serveur si ce fichier est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export default app;
