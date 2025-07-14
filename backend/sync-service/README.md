# Service de synchronisation

Ce service gère la synchronisation des contenus depuis différentes sources (YouTube, TikTok, scrapers) vers Elasticsearch.

## Fonctionnalités

- Synchronisation automatique des contenus via des tâches cron
- Serveur de métriques Prometheus intégré
- Gestion des quotas d'API (YouTube)
- Support de multiples sources de données

## Serveur de métriques

Le service expose maintenant un serveur Express avec des métriques Prometheus sur le port 3000 (configurable via `METRICS_PORT`).

### Endpoints disponibles

- `GET /metrics` - Métriques Prometheus
- `GET /health` - Endpoint de santé

### Métriques disponibles

#### Compteurs (`Counter`)

- `sync_operations_total` - Nombre total d'opérations de synchronisation
  - Labels: `operation_type`, `source_type`, `status`
- `indexed_contents_total` - Nombre total de contenus indexés
  - Labels: `source_type`
- `sync_errors_total` - Nombre total d'erreurs de synchronisation
  - Labels: `error_type`, `source_type`

#### Histogrammes (`Histogram`)

- `sync_duration_seconds` - Durée des opérations de synchronisation
  - Labels: `operation_type`, `source_type`
  - Buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120] secondes

#### Jauges (`Gauge`)

- `pending_questions_count` - Nombre de questions en attente de traitement
  - Labels: `source_type`
- `youtube_api_calls_count` - Nombre d'appels API YouTube utilisés

## Configuration

Variables d'environnement :

```env
# Base de données
POSTGRES_HOST=localhost
POSTGRES_DB=database_name
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432

# APIs
YOUTUBE_API_KEY=your_youtube_api_key

# Serveur de métriques
METRICS_PORT=3000
```

## Installation

```bash
# Installation des dépendances
npm install

# Compilation TypeScript
npm run build

# Démarrage en mode développement
npm run dev

# Démarrage en production
npm start
```

## Utilisation avec Prometheus

Pour collecter les métriques avec Prometheus, ajoutez cette configuration dans votre `prometheus.yml` :

```yaml
scrape_configs:
  - job_name: "sync-service"
    static_configs:
      - targets: ["localhost:3000"]
```

## Exemples de requêtes Prometheus

```promql
# Taux d'erreur de synchronisation
rate(sync_errors_total[5m])

# Durée moyenne des synchronisations
rate(sync_duration_seconds_sum[5m]) / rate(sync_duration_seconds_count[5m])

# Nombre de contenus indexés par minute
rate(indexed_contents_total[1m]) * 60
```

## Structure du projet

```
src/
├── services/
│   ├── elasticsearch.service.ts
│   ├── youtube.service.ts
│   ├── tiktok.service.ts
│   ├── scraper.service.ts
│   └── metrics.service.ts      # Nouveau service de métriques
├── interfaces/
│   └── content.interface.ts
├── server.ts                    # Nouveau serveur Express
└── index.ts                     # Point d'entrée principal
```
