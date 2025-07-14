# Métriques Prometheus - Query Forge Dev API

Ce document décrit les métriques Prometheus disponibles pour l'API Query Forge Dev développée avec NestJS.

## Endpoint des métriques

- **URL** : `http://localhost:3000/metrics`
- **Port** : Configurable via `NEST_PORT` (défaut: 3000)
- **Format** : Prometheus text format
- **Authentification** : Aucune (endpoint public)

## Configuration

Le monitoring est configuré avec le package `@willsoto/nestjs-prometheus` qui fournit une intégration native avec NestJS.

## Métriques disponibles

### 1. Métriques système (par défaut)

Ces métriques sont automatiquement collectées par prom-client :

- `query_forge_process_cpu_user_seconds_total` - Temps CPU utilisateur
- `query_forge_process_cpu_system_seconds_total` - Temps CPU système
- `query_forge_process_cpu_seconds_total` - Temps CPU total
- `query_forge_process_start_time_seconds` - Heure de démarrage du processus
- `query_forge_process_resident_memory_bytes` - Mémoire résidente
- `query_forge_nodejs_eventloop_lag_seconds` - Latence de l'event loop
- `query_forge_nodejs_active_handles_total` - Handles actifs Node.js
- `query_forge_nodejs_active_requests_total` - Requêtes actives Node.js

### 2. Métriques HTTP

#### `query_forge_http_requests_total`

- **Description** : Nombre total de requêtes HTTP
- **Type** : Counter
- **Labels** :
  - `method` : Méthode HTTP (GET, POST, PUT, DELETE, etc.)
  - `route` : Route de l'API
  - `status` : Code de statut HTTP

#### `query_forge_http_request_duration_seconds`

- **Description** : Durée des requêtes HTTP en secondes
- **Type** : Histogram
- **Labels** :
  - `method` : Méthode HTTP
  - `route` : Route de l'API
- **Buckets** : [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5] secondes

### 3. Métriques base de données

#### `query_forge_database_operations_total`

- **Description** : Nombre total d'opérations en base de données
- **Type** : Counter
- **Labels** :
  - `operation` : Type d'opération (create, read, update, delete)
  - `entity` : Entité concernée (user, question, content_source, question_usage)
  - `status` : Statut de l'opération (success, error)

#### `query_forge_database_operation_duration_seconds`

- **Description** : Durée des opérations en base de données en secondes
- **Type** : Histogram
- **Labels** :
  - `operation` : Type d'opération
  - `entity` : Entité concernée
- **Buckets** : [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2] secondes

### 4. Métriques métier

#### `query_forge_active_users_gauge`

- **Description** : Nombre d'utilisateurs actifs
- **Type** : Gauge

#### `query_forge_questions_total`

- **Description** : Nombre total d'opérations sur les questions
- **Type** : Counter
- **Labels** :
  - `operation` : Type d'opération (create, findAll, findOne, update, remove)

#### `query_forge_content_sources_total`

- **Description** : Nombre total d'opérations sur les sources de contenu
- **Type** : Counter
- **Labels** :
  - `operation` : Type d'opération (create, findAll, findOne, update, remove)

#### `query_forge_question_usages_total`

- **Description** : Nombre total d'opérations sur les usages de questions
- **Type** : Counter
- **Labels** :
  - `operation` : Type d'opération (create, findAll, findOne, update, remove)

## Exemples de requêtes PromQL

### Performance HTTP

#### Taux de requêtes par seconde

```promql
rate(query_forge_http_requests_total[5m])
```

#### Taux d'erreur HTTP

```promql
rate(query_forge_http_requests_total{status=~"4..|5.."}[5m]) / rate(query_forge_http_requests_total[5m])
```

#### Durée moyenne des requêtes

```promql
rate(query_forge_http_request_duration_seconds_sum[5m]) / rate(query_forge_http_request_duration_seconds_count[5m])
```

#### Latence 95e percentile

```promql
histogram_quantile(0.95, rate(query_forge_http_request_duration_seconds_bucket[5m]))
```

### Performance base de données

#### Opérations DB par seconde

```promql
rate(query_forge_database_operations_total[5m]) by (entity, operation)
```

#### Taux d'erreur base de données

```promql
rate(query_forge_database_operations_total{status="error"}[5m]) / rate(query_forge_database_operations_total[5m])
```

### Métriques métier

#### Questions créées par minute

```promql
rate(query_forge_questions_total{operation="create"}[1m]) * 60
```

#### Activité utilisateurs

```promql
query_forge_active_users_gauge
```

## Configuration Prometheus

Ajoutez cette configuration dans votre fichier `prometheus.yml` :

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'query-forge-dev'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s
```

## Alertes suggérées

### Taux d'erreur élevé

```yaml
- alert: HighErrorRate
  expr: rate(query_forge_http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Taux d'erreur HTTP élevé"
    description: "Le taux d'erreur HTTP est supérieur à 5% pendant 2 minutes"
```

### Latence élevée

```yaml
- alert: HighLatency
  expr: histogram_quantile(0.95, rate(query_forge_http_request_duration_seconds_bucket[5m])) > 1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'Latence HTTP élevée'
    description: 'La latence 95e percentile dépasse 1 seconde'
```

### Erreurs base de données

```yaml
- alert: DatabaseErrors
  expr: rate(query_forge_database_operations_total{status="error"}[5m]) > 0.01
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: 'Erreurs base de données'
    description: "Taux d'erreur base de données supérieur à 1%"
```

### Utilisation mémoire

```yaml
- alert: HighMemoryUsage
  expr: query_forge_process_resident_memory_bytes > 500000000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: 'Utilisation mémoire élevée'
    description: "L'utilisation mémoire dépasse 500MB"
```

## Dashboard Grafana

### Panneaux suggérés

1. **Vue d'ensemble**

   - Taux de requêtes : `rate(query_forge_http_requests_total[5m])`
   - Taux d'erreur : `rate(query_forge_http_requests_total{status=~"5.."}[5m])`
   - Latence moyenne : `rate(query_forge_http_request_duration_seconds_sum[5m]) / rate(query_forge_http_request_duration_seconds_count[5m])`

2. **Performance**

   - Histogramme de latence : `query_forge_http_request_duration_seconds_bucket`
   - CPU : `rate(query_forge_process_cpu_seconds_total[5m])`
   - Mémoire : `query_forge_process_resident_memory_bytes`

3. **Base de données**

   - Opérations : `rate(query_forge_database_operations_total[5m])`
   - Erreurs : `rate(query_forge_database_operations_total{status="error"}[5m])`

4. **Métier**
   - Questions par heure : `rate(query_forge_questions_total[1h]) * 3600`
   - Utilisateurs actifs : `query_forge_active_users_gauge`

## Intégration avec l'application

### Intercepteur automatique

L'intercepteur `MetricsInterceptor` capture automatiquement :

- Toutes les requêtes HTTP
- Durée des requêtes
- Codes de statut

### Instrumentation manuelle

Pour instrumenter vos services :

```typescript
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class YourService {
  constructor(private readonly metricsService: MetricsService) {}

  async yourMethod() {
    // Votre logique métier
    this.metricsService.incrementQuestions('create');
  }
}
```

## Sécurité

L'endpoint `/metrics` est public pour permettre à Prometheus de le scraper. Si vous souhaitez le sécuriser :

1. Utilisez un reverse proxy (nginx) avec authentification
2. Configurez des règles de firewall
3. Utilisez un VPN ou un réseau privé

## Troubleshooting

### Métriques manquantes

1. Vérifiez que le module `MetricsModule` est importé dans `AppModule`
2. Vérifiez que l'intercepteur `MetricsInterceptor` est configuré globalement
3. Vérifiez les logs de l'application au démarrage

### Performance

- Les métriques Prometheus ajoutent un overhead minimal (~1-2ms par requête)
- Les métriques sont stockées en mémoire
- Utilisez un scrape_interval approprié (15-60s recommandé)
