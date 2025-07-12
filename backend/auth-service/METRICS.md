# Métriques Prometheus - Service d'authentification

Ce document décrit les métriques Prometheus exposées par le service d'authentification.

## Endpoint des métriques

Les métriques sont disponibles à l'endpoint : `GET /metrics`

```bash
curl http://localhost:4000/metrics
```

## Métriques disponibles

### 1. Métriques d'authentification

#### `auth_operations_total`

- **Type** : Counter
- **Description** : Nombre total d'opérations d'authentification
- **Labels** :
  - `operation` : Type d'opération (`register`, `login`, `refresh`)
  - `status` : Résultat (`success`, `error`)
  - `method` : Méthode HTTP (`POST`)

```promql
# Taux de réussite des connexions
rate(auth_operations_total{operation="login",status="success"}[5m]) /
rate(auth_operations_total{operation="login"}[5m]) * 100
```

#### `auth_operation_duration_seconds`

- **Type** : Histogram
- **Description** : Durée des opérations d'authentification en secondes
- **Labels** :
  - `operation` : Type d'opération (`register`, `login`, `refresh`)
  - `method` : Méthode HTTP (`POST`)

```promql
# Latence médiane des connexions
histogram_quantile(0.5, rate(auth_operation_duration_seconds_bucket{operation="login"}[5m]))
```

### 2. Métriques de sécurité

#### `auth_failures_total`

- **Type** : Counter
- **Description** : Nombre total de tentatives d'authentification échouées
- **Labels** :
  - `operation` : Type d'opération (`register`, `login`, `refresh`)
  - `reason` : Raison de l'échec (`missing_credentials`, `email_already_exists`, `invalid_credentials`, etc.)

```promql
# Taux d'échecs par raison
rate(auth_failures_total[5m])
```

#### `auth_active_tokens`

- **Type** : Gauge
- **Description** : Nombre de tokens actifs générés
- **Labels** :
  - `token_type` : Type de token (`access`, `refresh`)

### 3. Métriques de base de données

#### `auth_database_operations_total`

- **Type** : Counter
- **Description** : Nombre total d'opérations de base de données pour les utilisateurs
- **Labels** :
  - `operation` : Type d'opération (`findUserByEmail`, `findUserById`, `createUser`)
  - `table` : Table de la base de données (`user`)
  - `status` : Résultat (`success`, `error`)

#### `auth_database_operation_duration_seconds`

- **Type** : Histogram
- **Description** : Durée des opérations de base de données en secondes
- **Labels** :
  - `operation` : Type d'opération
  - `table` : Table de la base de données

```promql
# Latence des requêtes de base de données
histogram_quantile(0.95, rate(auth_database_operation_duration_seconds_bucket[5m]))
```

### 4. Métriques HTTP

#### `auth_http_requests_total`

- **Type** : Counter
- **Description** : Nombre total de requêtes HTTP reçues
- **Labels** :
  - `method` : Méthode HTTP (`GET`, `POST`)
  - `route` : Route demandée (`/auth/login`, `/auth/register`, etc.)
  - `status_code` : Code de statut HTTP

#### `auth_http_request_duration_seconds`

- **Type** : Histogram
- **Description** : Durée des requêtes HTTP en secondes
- **Labels** :
  - `method` : Méthode HTTP
  - `route` : Route demandée

### 5. Métriques métier

#### `auth_registered_users_total`

- **Type** : Counter
- **Description** : Nombre total d'utilisateurs enregistrés
- **Labels** :
  - `role` : Rôle de l'utilisateur (`user`, `admin`)

#### `auth_password_hashing_duration_seconds`

- **Type** : Histogram
- **Description** : Durée du hachage des mots de passe en secondes

```promql
# Temps de hachage des mots de passe
histogram_quantile(0.95, rate(auth_password_hashing_duration_seconds_bucket[5m]))
```

## Configuration Prometheus

Ajoutez cette configuration à votre fichier `prometheus.yml` :

```yaml
scrape_configs:
  - job_name: "auth-service"
    static_configs:
      - targets: ["auth-service:4000"]
    metrics_path: "/metrics"
    scrape_interval: 15s
```

## Alertes recommandées

### Alertes de sécurité

```yaml
groups:
  - name: auth-security
    rules:
      - alert: HighAuthFailureRate
        expr: rate(auth_failures_total[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Taux élevé d'échecs d'authentification"
          description: "{{ $value }} échecs d'authentification par seconde"

      - alert: SuspiciousLoginAttempts
        expr: increase(auth_failures_total{reason="invalid_credentials"}[10m]) > 50
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Tentatives de connexion suspectes"
          description: "{{ $value }} tentatives de connexion échouées en 10 minutes"
```

### Alertes de performance

```yaml
- name: auth-performance
  rules:
    - alert: HighAuthLatency
      expr: histogram_quantile(0.95, rate(auth_operation_duration_seconds_bucket[5m])) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Latence élevée des opérations d'authentification"
        description: "95e percentile : {{ $value }}s"

    - alert: DatabaseSlowQueries
      expr: histogram_quantile(0.95, rate(auth_database_operation_duration_seconds_bucket[5m])) > 0.5
      for: 3m
      labels:
        severity: warning
      annotations:
        summary: "Requêtes de base de données lentes"
        description: "95e percentile : {{ $value }}s"
```

## Dashboard Grafana

### Panels recommandés

1. **Vue d'ensemble des authentifications**

   ```promql
   sum by (operation) (rate(auth_operations_total[5m]))
   ```

2. **Taux de réussite**

   ```promql
   sum(rate(auth_operations_total{status="success"}[5m])) /
   sum(rate(auth_operations_total[5m])) * 100
   ```

3. **Top des erreurs d'authentification**

   ```promql
   topk(5, sum by (reason) (rate(auth_failures_total[5m])))
   ```

4. **Latence des opérations**

   ```promql
   histogram_quantile(0.50, rate(auth_operation_duration_seconds_bucket[5m]))
   histogram_quantile(0.95, rate(auth_operation_duration_seconds_bucket[5m]))
   histogram_quantile(0.99, rate(auth_operation_duration_seconds_bucket[5m]))
   ```

5. **Performance base de données**
   ```promql
   histogram_quantile(0.95, rate(auth_database_operation_duration_seconds_bucket[5m]))
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
# Connexions en cours
curl -s http://localhost:4000/metrics | grep auth_operations_total

# Échecs récents
curl -s http://localhost:4000/metrics | grep auth_failures_total
```

### Requêtes PromQL utiles

```promql
# Taux d'inscriptions par minute
rate(auth_operations_total{operation="register",status="success"}[1m]) * 60

# Répartition des rôles des nouveaux utilisateurs
sum by (role) (rate(auth_registered_users_total[5m]))

# Temps de réponse moyen par endpoint
avg by (route) (rate(auth_http_request_duration_seconds_sum[5m]) / rate(auth_http_request_duration_seconds_count[5m]))
```
