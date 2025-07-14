import {
  register,
  collectDefaultMetrics,
  Counter,
  Histogram,
  Gauge,
} from "prom-client";

// Activer la collecte des métriques par défaut
collectDefaultMetrics();

// Métriques d'authentification
export const authOperations = new Counter({
  name: "auth_operations_total",
  help: "Nombre total d'opérations d'authentification",
  labelNames: ["operation", "status", "method"],
});

export const authDuration = new Histogram({
  name: "auth_operation_duration_seconds",
  help: "Durée des opérations d'authentification en secondes",
  labelNames: ["operation", "method"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Métriques de sécurité
export const authFailures = new Counter({
  name: "auth_failures_total",
  help: "Nombre total de tentatives d'authentification échouées",
  labelNames: ["operation", "reason"],
});

export const activeTokens = new Gauge({
  name: "auth_active_tokens",
  help: "Nombre de tokens actifs générés",
  labelNames: ["token_type"],
});

// Métriques de base de données pour les utilisateurs
export const databaseOperations = new Counter({
  name: "auth_database_operations_total",
  help: "Nombre total d'opérations de base de données pour les utilisateurs",
  labelNames: ["operation", "table", "status"],
});

export const databaseDuration = new Histogram({
  name: "auth_database_operation_duration_seconds",
  help: "Durée des opérations de base de données en secondes",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
});

// Métriques HTTP
export const httpRequests = new Counter({
  name: "auth_http_requests_total",
  help: "Nombre total de requêtes HTTP reçues",
  labelNames: ["method", "route", "status_code"],
});

export const httpDuration = new Histogram({
  name: "auth_http_request_duration_seconds",
  help: "Durée des requêtes HTTP en secondes",
  labelNames: ["method", "route"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

// Métriques des utilisateurs
export const registeredUsers = new Counter({
  name: "auth_registered_users_total",
  help: "Nombre total d'utilisateurs enregistrés",
  labelNames: ["role"],
});

export const passwordHashing = new Histogram({
  name: "auth_password_hashing_duration_seconds",
  help: "Durée du hachage des mots de passe en secondes",
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
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
export function incrementAuthOperation(
  operation: string,
  status: "success" | "error",
  method: string
) {
  authOperations.inc({ operation, status, method });
}

export function recordAuthDuration(
  operation: string,
  method: string,
  duration: number
) {
  authDuration.observe({ operation, method }, duration);
}

export function incrementAuthFailure(operation: string, reason: string) {
  authFailures.inc({ operation, reason });
}

export function setActiveTokens(
  tokenType: "access" | "refresh",
  count: number
) {
  activeTokens.set({ token_type: tokenType }, count);
}

export function incrementDatabaseOperation(
  operation: string,
  table: string,
  status: "success" | "error"
) {
  databaseOperations.inc({ operation, table, status });
}

export function recordDatabaseDuration(
  operation: string,
  table: string,
  duration: number
) {
  databaseDuration.observe({ operation, table }, duration);
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

export function incrementRegisteredUser(role: "user" | "admin") {
  registeredUsers.inc({ role });
}

export function recordPasswordHashing(duration: number) {
  passwordHashing.observe(duration);
}
