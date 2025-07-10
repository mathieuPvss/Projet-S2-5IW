import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsCounter: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('database_operations_total')
    private readonly dbOperationsCounter: Counter<string>,
    @InjectMetric('database_operation_duration_seconds')
    private readonly dbOperationDuration: Histogram<string>,
    @InjectMetric('active_users_gauge')
    private readonly activeUsersGauge: Gauge<string>,
    @InjectMetric('questions_total')
    private readonly questionsCounter: Counter<string>,
    @InjectMetric('content_sources_total')
    private readonly contentSourcesCounter: Counter<string>,
    @InjectMetric('question_usages_total')
    private readonly questionUsagesCounter: Counter<string>,
  ) {}

  // Métriques HTTP
  incrementHttpRequests(method: string, route: string, status: string) {
    this.httpRequestsCounter.inc({ method, route, status });
  }

  recordHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // Métriques base de données
  incrementDbOperations(operation: string, entity: string, status: string) {
    this.dbOperationsCounter.inc({ operation, entity, status });
  }

  recordDbDuration(operation: string, entity: string, duration: number) {
    this.dbOperationDuration.observe({ operation, entity }, duration);
  }

  // Métriques métier
  setActiveUsers(count: number) {
    this.activeUsersGauge.set(count);
  }

  incrementQuestions(operation: string) {
    this.questionsCounter.inc({ operation });
  }

  incrementContentSources(operation: string) {
    this.contentSourcesCounter.inc({ operation });
  }

  incrementQuestionUsages(operation: string) {
    this.questionUsagesCounter.inc({ operation });
  }

  // Obtenir toutes les métriques
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
