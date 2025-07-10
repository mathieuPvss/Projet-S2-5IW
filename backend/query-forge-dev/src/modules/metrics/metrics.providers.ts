import {
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

// Métriques HTTP
export const HttpRequestsCounterProvider = makeCounterProvider({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
});

export const HttpRequestDurationProvider = makeHistogramProvider({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// Métriques base de données
export const DatabaseOperationsCounterProvider = makeCounterProvider({
  name: 'database_operations_total',
  help: "Nombre total d'opérations en base de données",
  labelNames: ['operation', 'entity', 'status'],
});

export const DatabaseOperationDurationProvider = makeHistogramProvider({
  name: 'database_operation_duration_seconds',
  help: 'Durée des opérations en base de données en secondes',
  labelNames: ['operation', 'entity'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Métriques métier
export const ActiveUsersGaugeProvider = makeGaugeProvider({
  name: 'active_users_gauge',
  help: "Nombre d'utilisateurs actifs",
});

export const QuestionsCounterProvider = makeCounterProvider({
  name: 'questions_total',
  help: "Nombre total d'opérations sur les questions",
  labelNames: ['operation'],
});

export const ContentSourcesCounterProvider = makeCounterProvider({
  name: 'content_sources_total',
  help: "Nombre total d'opérations sur les sources de contenu",
  labelNames: ['operation'],
});

export const QuestionUsagesCounterProvider = makeCounterProvider({
  name: 'question_usages_total',
  help: "Nombre total d'opérations sur les usages de questions",
  labelNames: ['operation'],
});

// Export de tous les providers
export const MetricsProviders = [
  HttpRequestsCounterProvider,
  HttpRequestDurationProvider,
  DatabaseOperationsCounterProvider,
  DatabaseOperationDurationProvider,
  ActiveUsersGaugeProvider,
  QuestionsCounterProvider,
  ContentSourcesCounterProvider,
  QuestionUsagesCounterProvider,
];
