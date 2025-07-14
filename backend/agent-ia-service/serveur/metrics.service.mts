import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

// Activer la collecte des métriques par défaut
collectDefaultMetrics();

// Métriques des agents IA
export const agentOperations = new Counter({
  name: "agent_operations_total",
  help: "Nombre total d'opérations d'agents IA",
  labelNames: ["agent_id", "operation", "status", "method"],
});

export const agentDuration = new Histogram({
  name: "agent_operation_duration_seconds",
  help: "Durée des opérations d'agents IA en secondes",
  labelNames: ["agent_id", "operation", "method"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
});

// Métriques de streaming SSE
export const streamingSessions = new Gauge({
  name: "agent_streaming_sessions_active",
  help: "Nombre de sessions de streaming actives",
  labelNames: ["agent_id"],
});

export const streamingEvents = new Counter({
  name: "agent_streaming_events_total",
  help: "Nombre total d'événements de streaming envoyés",
  labelNames: ["agent_id", "event_type"],
});

export const streamingDuration = new Histogram({
  name: "agent_streaming_duration_seconds",
  help: "Durée des sessions de streaming en secondes",
  labelNames: ["agent_id"],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600],
});

// Métriques des conversations
export const conversationOperations = new Counter({
  name: "agent_conversation_operations_total",
  help: "Nombre total d'opérations sur les conversations",
  labelNames: ["operation", "status"],
});

export const activeConversations = new Gauge({
  name: "agent_conversations_active",
  help: "Nombre de conversations actives en mémoire",
});

export const conversationMessages = new Histogram({
  name: "agent_conversation_messages_count",
  help: "Nombre de messages par conversation",
  buckets: [1, 5, 10, 25, 50, 100, 250, 500],
});

// Métriques des outils LangChain
export const toolExecutions = new Counter({
  name: "agent_tool_executions_total",
  help: "Nombre total d'exécutions d'outils",
  labelNames: ["agent_id", "tool_name", "status"],
});

export const toolDuration = new Histogram({
  name: "agent_tool_execution_duration_seconds",
  help: "Durée d'exécution des outils en secondes",
  labelNames: ["agent_id", "tool_name"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30],
});

// Métriques des erreurs spécifiques aux agents
export const agentErrors = new Counter({
  name: "agent_errors_total",
  help: "Nombre total d'erreurs d'agents IA",
  labelNames: ["agent_id", "operation", "error_type"],
});

// Métriques HTTP
export const httpRequests = new Counter({
  name: "agent_http_requests_total",
  help: "Nombre total de requêtes HTTP reçues",
  labelNames: ["method", "route", "status_code"],
});

export const httpDuration = new Histogram({
  name: "agent_http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
});

// Métriques de performance des modèles IA
export const modelInferences = new Counter({
  name: "agent_model_inferences_total",
  help: "Nombre total d'inférences de modèles IA",
  labelNames: ["agent_id", "model_name", "status"],
});

export const modelLatency = new Histogram({
  name: "agent_model_latency_seconds",
  help: "Latence des modèles IA en secondes",
  labelNames: ["agent_id", "model_name"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30, 60],
});

// Métriques des tokens
export const tokensUsed = new Counter({
  name: "agent_tokens_used_total",
  help: "Nombre total de tokens utilisés",
  labelNames: ["agent_id", "token_type"], // input, output
});

// Fonction pour obtenir toutes les métriques
export function getMetrics(): Promise<string> {
  return register.metrics();
}

// Fonction de reset pour les tests
export function resetMetrics(): void {
  register.resetMetrics();
}

// Helper functions pour incrementer les métriques

export function incrementAgentOperation(
  agentId: string,
  operation: string,
  status: "success" | "error",
  method: string
) {
  agentOperations.inc({ agent_id: agentId, operation, status, method });
}

export function recordAgentDuration(
  agentId: string,
  operation: string,
  method: string,
  duration: number
) {
  agentDuration.observe({ agent_id: agentId, operation, method }, duration);
}

export function incrementStreamingSession(agentId: string) {
  streamingSessions.inc({ agent_id: agentId });
}

export function decrementStreamingSession(agentId: string) {
  streamingSessions.dec({ agent_id: agentId });
}

export function incrementStreamingEvent(agentId: string, eventType: string) {
  streamingEvents.inc({ agent_id: agentId, event_type: eventType });
}

export function recordStreamingDuration(agentId: string, duration: number) {
  streamingDuration.observe({ agent_id: agentId }, duration);
}

export function incrementConversationOperation(
  operation: string,
  status: "success" | "error"
) {
  conversationOperations.inc({ operation, status });
}

export function setActiveConversations(count: number) {
  activeConversations.set(count);
}

export function recordConversationMessages(count: number) {
  conversationMessages.observe(count);
}

export function incrementToolExecution(
  agentId: string,
  toolName: string,
  status: "success" | "error"
) {
  toolExecutions.inc({ agent_id: agentId, tool_name: toolName, status });
}

export function recordToolDuration(
  agentId: string,
  toolName: string,
  duration: number
) {
  toolDuration.observe({ agent_id: agentId, tool_name: toolName }, duration);
}

export function incrementAgentError(
  agentId: string,
  operation: string,
  errorType: string
) {
  agentErrors.inc({ agent_id: agentId, operation, error_type: errorType });
}

export function incrementHttpRequest(
  method: string,
  route: string,
  statusCode: string
) {
  httpRequests.inc({ method, route, status_code: statusCode });
}

export function recordHttpDuration(
  method: string,
  route: string,
  duration: number
) {
  httpDuration.observe({ method, route }, duration);
}

export function incrementModelInference(
  agentId: string,
  modelName: string,
  status: "success" | "error"
) {
  modelInferences.inc({ agent_id: agentId, model_name: modelName, status });
}

export function recordModelLatency(
  agentId: string,
  modelName: string,
  latency: number
) {
  modelLatency.observe({ agent_id: agentId, model_name: modelName }, latency);
}

export function incrementTokensUsed(
  agentId: string,
  tokenType: "input" | "output",
  count: number
) {
  tokensUsed.inc({ agent_id: agentId, token_type: tokenType }, count);
}
