import { register, Counter, Histogram, Gauge } from "prom-client";

// Compteurs pour les opérations de synchronisation
export const syncOperationsCounter = new Counter({
  name: "sync_operations_total",
  help: "Nombre total d'opérations de synchronisation",
  labelNames: ["operation_type", "source_type", "status"],
});

// Histogramme pour la durée des opérations
export const syncDurationHistogram = new Histogram({
  name: "sync_duration_seconds",
  help: "Durée des opérations de synchronisation en secondes",
  labelNames: ["operation_type", "source_type"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120],
});

// Gauge pour les questions en attente
export const pendingQuestionsGauge = new Gauge({
  name: "pending_questions_count",
  help: "Nombre de questions en attente de traitement",
  labelNames: ["source_type"],
});

// Gauge pour les appels API YouTube
export const youtubeApiCallsGauge = new Gauge({
  name: "youtube_api_calls_count",
  help: "Nombre d'appels API YouTube utilisés",
});

// Compteur pour les contenus indexés
export const indexedContentsCounter = new Counter({
  name: "indexed_contents_total",
  help: "Nombre total de contenus indexés",
  labelNames: ["source_type"],
});

// Métriques d'erreur
export const errorCounter = new Counter({
  name: "sync_errors_total",
  help: "Nombre total d'erreurs de synchronisation",
  labelNames: ["error_type", "source_type"],
});

// Fonction pour obtenir les métriques
export const getMetrics = () => {
  return register.metrics();
};

// Fonction pour réinitialiser les métriques (utile pour les tests)
export const resetMetrics = () => {
  register.resetMetrics();
};

export { register };
