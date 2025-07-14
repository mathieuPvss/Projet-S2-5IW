# Métriques Prometheus - Service des Agents IA

Ce document décrit les métriques Prometheus exposées par le service des agents IA.

## Endpoint des métriques

Les métriques sont disponibles à l'endpoint : `GET /metrics`

```bash
curl http://localhost:8080/metrics
```

## Métriques disponibles

### 1. Métriques des agents IA

#### `agent_operations_total`

- **Type** : Counter
- **Description** : Nombre total d'opérations d'agents IA
- **Labels** :
  - `agent_id` : Identifiant de l'agent (`translate-for-elk`, etc.)
  - `operation` : Type d'opération (`invoke`, `stream`, `stop`)
  - `status` : Résultat (`success`, `error`)
  - `method` : Méthode HTTP (`POST`)

```promql
# Taux de succès des invocations d'agents
rate(agent_operations_total{operation="invoke",status="success"}[5m]) /
rate(agent_operations_total{operation="invoke"}[5m]) * 100
```

#### `agent_operation_duration_seconds`

- **Type** : Histogram
- **Description** : Durée des opérations d'agents IA en secondes
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `operation` : Type d'opération
  - `method` : Méthode HTTP

```promql
# Latence médiane des invocations d'agents
histogram_quantile(0.5, rate(agent_operation_duration_seconds_bucket{operation="invoke"}[5m]))
```

### 2. Métriques de streaming SSE

#### `agent_streaming_sessions_active`

- **Type** : Gauge
- **Description** : Nombre de sessions de streaming actives
- **Labels** :
  - `agent_id` : Identifiant de l'agent

#### `agent_streaming_events_total`

- **Type** : Counter
- **Description** : Nombre total d'événements de streaming envoyés
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `event_type` : Type d'événement (`stream_start`, `stream_token`, `tool_execution_start`, etc.)

```promql
# Événements de streaming par type
sum by (event_type) (rate(agent_streaming_events_total[5m]))
```

#### `agent_streaming_duration_seconds`

- **Type** : Histogram
- **Description** : Durée des sessions de streaming en secondes
- **Labels** :
  - `agent_id` : Identifiant de l'agent

### 3. Métriques des conversations

#### `agent_conversation_operations_total`

- **Type** : Counter
- **Description** : Nombre total d'opérations sur les conversations
- **Labels** :
  - `operation` : Type d'opération (`get_conversation`, `list_conversations`)
  - `status` : Résultat (`success`, `error`)

#### `agent_conversations_active`

- **Type** : Gauge
- **Description** : Nombre de conversations actives en mémoire

#### `agent_conversation_messages_count`

- **Type** : Histogram
- **Description** : Nombre de messages par conversation

```promql
# Longueur moyenne des conversations
histogram_quantile(0.5, rate(agent_conversation_messages_count_bucket[5m]))
```

### 4. Métriques des outils LangChain

#### `agent_tool_executions_total`

- **Type** : Counter
- **Description** : Nombre total d'exécutions d'outils
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `tool_name` : Nom de l'outil (`search_elasticsearch`, `translate_question`, etc.)
  - `status` : Résultat (`success`, `error`)

#### `agent_tool_execution_duration_seconds`

- **Type** : Histogram
- **Description** : Durée d'exécution des outils en secondes
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `tool_name` : Nom de l'outil

```promql
# Performance des outils par agent
histogram_quantile(0.95, rate(agent_tool_execution_duration_seconds_bucket[5m]))
```

### 5. Métriques d'erreurs

#### `agent_errors_total`

- **Type** : Counter
- **Description** : Nombre total d'erreurs d'agents IA
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `operation` : Type d'opération
  - `error_type` : Type d'erreur

```promql
# Top des erreurs par agent
topk(5, sum by (agent_id, error_type) (rate(agent_errors_total[5m])))
```

### 6. Métriques HTTP

#### `agent_http_requests_total`

- **Type** : Counter
- **Description** : Nombre total de requêtes HTTP reçues
- **Labels** :
  - `method` : Méthode HTTP
  - `route` : Route demandée
  - `status_code` : Code de statut HTTP

#### `agent_http_request_duration_seconds`

- **Type** : Histogram
- **Description** : Durée des requêtes HTTP en secondes
- **Labels** :
  - `method` : Méthode HTTP
  - `route` : Route demandée

### 7. Métriques de performance des modèles IA

#### `agent_model_inferences_total`

- **Type** : Counter
- **Description** : Nombre total d'inférences de modèles IA
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `model_name` : Nom du modèle (`gpt-4`, `gpt-3.5-turbo`, etc.)
  - `status` : Résultat (`success`, `error`)

#### `agent_model_latency_seconds`

- **Type** : Histogram
- **Description** : Latence des modèles IA en secondes
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `model_name` : Nom du modèle

#### `agent_tokens_used_total`

- **Type** : Counter
- **Description** : Nombre total de tokens utilisés
- **Labels** :
  - `agent_id` : Identifiant de l'agent
  - `token_type` : Type de token (`input`, `output`)

## Configuration Prometheus

Ajoutez cette configuration à votre fichier `prometheus.yml` :

```yaml
scrape_configs:
  - job_name: "agent-ia-service"
    static_configs:
      - targets: ["agent-ia-service:8080"]
    metrics_path: "/metrics"
    scrape_interval: 15s
```

## Alertes recommandées

### Alertes de performance

```yaml
groups:
  - name: agent-performance
    rules:
      - alert: HighAgentLatency
        expr: histogram_quantile(0.95, rate(agent_operation_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latence élevée des agents IA"
          description: "95e percentile : {{ $value }}s pour l'agent {{ $labels.agent_id }}"

      - alert: AgentErrorRate
        expr: rate(agent_errors_total[5m]) / rate(agent_operations_total[5m]) > 0.1
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreur élevé pour les agents IA"
          description: "{{ $value | humanizePercentage }} d'erreurs pour l'agent {{ $labels.agent_id }}"
```

### Alertes de streaming

```yaml
- name: agent-streaming
  rules:
    - alert: TooManyActiveStreams
      expr: sum(agent_streaming_sessions_active) > 100
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "Trop de sessions de streaming actives"
        description: "{{ $value }} sessions de streaming actives"

    - alert: LongStreamingSessions
      expr: histogram_quantile(0.95, rate(agent_streaming_duration_seconds_bucket[5m])) > 300
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Sessions de streaming très longues"
        description: "95e percentile : {{ $value }}s"
```

### Alertes des outils

```yaml
- name: agent-tools
  rules:
    - alert: ToolExecutionFailures
      expr: rate(agent_tool_executions_total{status="error"}[5m]) > 5
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "Échecs d'exécution d'outils"
        description: "{{ $value }} échecs/sec pour l'outil {{ $labels.tool_name }}"

    - alert: SlowToolExecution
      expr: histogram_quantile(0.95, rate(agent_tool_execution_duration_seconds_bucket[5m])) > 10
      for: 3m
      labels:
        severity: warning
      annotations:
        summary: "Exécution lente des outils"
        description: "95e percentile : {{ $value }}s pour {{ $labels.tool_name }}"
```

## Dashboard Grafana

### Panels recommandés

1. **Vue d'ensemble des agents**

   ```promql
   sum by (agent_id) (rate(agent_operations_total[5m]))
   ```

2. **Taux de succès par agent**

   ```promql
   sum by (agent_id) (rate(agent_operations_total{status="success"}[5m])) /
   sum by (agent_id) (rate(agent_operations_total[5m])) * 100
   ```

3. **Sessions de streaming actives**

   ```promql
   sum by (agent_id) (agent_streaming_sessions_active)
   ```

4. **Performance des outils**

   ```promql
   histogram_quantile(0.95, rate(agent_tool_execution_duration_seconds_bucket[5m]))
   ```

5. **Utilisation des tokens**

   ```promql
   sum by (agent_id, token_type) (rate(agent_tokens_used_total[5m]))
   ```

6. **Conversations actives**
   ```promql
   agent_conversations_active
   ```

## Métriques par défaut

Le service expose également les métriques par défaut de Node.js :

- `process_cpu_user_seconds_total`
- `process_cpu_system_seconds_total`
- `process_resident_memory_bytes`
- `nodejs_heap_size_total_bytes`
- `nodejs_heap_size_used_bytes`
- `nodejs_external_memory_bytes`
- `nodejs_gc_duration_seconds`

## Exemples d'utilisation

### Surveillance en temps réel

```bash
# Opérations d'agents en cours
curl -s http://localhost:8080/metrics | grep agent_operations_total

# Sessions de streaming
curl -s http://localhost:8080/metrics | grep agent_streaming_sessions_active
```

### Requêtes PromQL utiles

```promql
# Agents les plus utilisés
topk(5, sum by (agent_id) (rate(agent_operations_total[5m])))

# Latence moyenne par opération
avg by (operation) (rate(agent_operation_duration_seconds_sum[5m]) / rate(agent_operation_duration_seconds_count[5m]))

# Événements de streaming par minute
sum by (event_type) (rate(agent_streaming_events_total[1m])) * 60

# Taux d'utilisation des outils
sum by (tool_name) (rate(agent_tool_executions_total[5m]))

# Conversations avec le plus de messages
histogram_quantile(0.95, agent_conversation_messages_count_bucket)
```

## Configuration du monitoring

### Variables d'environnement pour les métriques

```bash
# Port du service (les métriques sont sur /metrics du même port)
AGENT_AI_PORT=8080

# Activer/désactiver l'authentification pour /metrics
METRICS_AUTH_DISABLED=true
```

### Intégration avec Docker Compose

```yaml
services:
  agent-ia-service:
    build: ./backend/agent-ia-service
    ports:
      - "8080:8080"
    environment:
      - AGENT_AI_PORT=8080
    labels:
      - "prometheus.io/scrape=true"
      - "prometheus.io/port=8080"
      - "prometheus.io/path=/metrics"
```
