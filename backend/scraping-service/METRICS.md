# Métriques Prometheus - Service de Scraping

Ce document décrit les métriques Prometheus disponibles pour le service de scraping.

## Endpoint des métriques

- **URL** : `http://localhost:3001/metrics`
- **Port** : Configurable via `SCRAPING_SERVICE_PORT` (défaut: 3001)
- **Format** : Prometheus text format

## Métriques disponibles

### 1. Compteurs (Counter)

#### `scraping_operations_total`

- **Description** : Nombre total d'opérations de scraping
- **Type** : Counter
- **Labels** :
  - `operation_type` : Type d'opération (`scrape_request`)
  - `status` : Statut de l'opération (`success`, `error`)

#### `scraping_extracted_data_total`

- **Description** : Nombre total de données extraites
- **Type** : Counter
- **Labels** :
  - `field_name` : Nom du champ extrait

#### `scraping_errors_total`

- **Description** : Nombre total d'erreurs de scraping
- **Type** : Counter
- **Labels** :
  - `error_type` : Type d'erreur (`validation_error`, `scraping_error`, `link_processing_error`, `field_extraction_error`)

#### `scraping_visited_pages_total`

- **Description** : Nombre total de pages visitées
- **Type** : Counter

#### `scraping_followed_links_total`

- **Description** : Nombre total de liens suivis
- **Type** : Counter

### 2. Histogrammes (Histogram)

#### `scraping_duration_seconds`

- **Description** : Durée des opérations de scraping en secondes
- **Type** : Histogram
- **Labels** :
  - `operation_type` : Type d'opération (`scrape_request`, `full_scrape`, `browser_init`)
- **Buckets** : [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300] secondes

#### `scraping_response_size_bytes`

- **Description** : Taille des réponses en bytes
- **Type** : Histogram
- **Buckets** : [1000, 5000, 10000, 50000, 100000, 500000, 1000000] bytes

### 3. Jauges (Gauge)

#### `scraping_active_pages`

- **Description** : Nombre de pages en cours de traitement
- **Type** : Gauge

#### `scraping_browser_instances`

- **Description** : Nombre d'instances de navigateur actives
- **Type** : Gauge

## Exemples de requêtes PromQL

### Taux de succès des opérations de scraping

```promql
rate(scraping_operations_total{status="success"}[5m]) / rate(scraping_operations_total[5m])
```

### Durée moyenne des opérations de scraping

```promql
rate(scraping_duration_seconds_sum[5m]) / rate(scraping_duration_seconds_count[5m])
```

### Taux d'erreur par type

```promql
rate(scraping_errors_total[5m]) by (error_type)
```

### Nombre de pages visitées par minute

```promql
rate(scraping_visited_pages_total[1m]) * 60
```

### Débit de données extraites

```promql
rate(scraping_extracted_data_total[5m]) by (field_name)
```

### Utilisation des ressources

```promql
scraping_browser_instances
```

## Configuration Prometheus

Ajoutez cette configuration dans votre fichier `prometheus.yml` :

```yaml
scrape_configs:
  - job_name: "scraping-service"
    static_configs:
      - targets: ["localhost:3001"]
    metrics_path: "/metrics"
    scrape_interval: 30s
```

## Alertes suggérées

### Taux d'erreur élevé

```yaml
- alert: HighScrapingErrorRate
  expr: rate(scraping_errors_total[5m]) > 0.1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Taux d'erreur de scraping élevé"
    description: "Le taux d'erreur de scraping est supérieur à 10% pendant 2 minutes"
```

### Durée de scraping excessive

```yaml
- alert: SlowScrapingOperation
  expr: rate(scraping_duration_seconds_sum[5m]) / rate(scraping_duration_seconds_count[5m]) > 60
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Opération de scraping lente"
    description: "La durée moyenne de scraping dépasse 60 secondes"
```

### Trop d'instances de navigateur

```yaml
- alert: TooManyBrowserInstances
  expr: scraping_browser_instances > 10
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Trop d'instances de navigateur"
    description: "Plus de 10 instances de navigateur sont actives"
```

## Monitoring et dashboards

### Grafana Dashboard

Voici un exemple de requêtes pour un dashboard Grafana :

1. **Taux de requêtes** :

   ```promql
   rate(scraping_operations_total[5m])
   ```

2. **Taux d'erreur** :

   ```promql
   rate(scraping_errors_total[5m])
   ```

3. **Durée moyenne** :

   ```promql
   rate(scraping_duration_seconds_sum[5m]) / rate(scraping_duration_seconds_count[5m])
   ```

4. **Pages par minute** :

   ```promql
   rate(scraping_visited_pages_total[1m]) * 60
   ```

5. **Instances actives** :
   ```promql
   scraping_browser_instances
   ```

## Informations de debug

Pour déboguer les problèmes de performance, utilisez ces métriques :

- `scraping_response_size_bytes` : Identifier les pages lourdes
- `scraping_duration_seconds` : Identifier les opérations lentes
- `scraping_browser_instances` : Surveiller les fuites de ressources
- `scraping_errors_total` : Identifier les problèmes récurrents
