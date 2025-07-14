# Auth Service

Microservice d'authentification Express pour Query Forge avec métriques Prometheus.

## Fonctionnalités

- Inscription (`/auth/register`)
- Connexion (`/auth/login`)
- Refresh token (`/auth/refresh`)
- JWT compatible avec l'API NestJS
- **Métriques Prometheus** pour monitoring et observabilité

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## Lancement en local

```bash
npm install
npm run dev
```

## Utilisation avec Docker Compose

Ajoutez ce service à votre `compose.yaml` et assurez-vous qu'il utilise les mêmes variables d'environnement que les autres services (notamment la connexion Postgres et le secret JWT).

## Endpoints

### API d'authentification

- **POST /auth/register**
  ```json
  { "email": "test@example.com", "password": "monmotdepasse" }
  ```
- **POST /auth/login**
  ```json
  { "email": "test@example.com", "password": "monmotdepasse" }
  ```
- **POST /auth/refresh**
  ```json
  { "refresh_token": "..." }
  ```

### Monitoring

- **GET /health** - Health check
- **GET /metrics** - **Métriques Prometheus**

## Métriques Prometheus

Le service expose des métriques détaillées sur :

- ✅ **Opérations d'authentification** (login, register, refresh)
- ✅ **Métriques de sécurité** (échecs d'authentification, raisons)
- ✅ **Performance base de données** (requêtes utilisateurs)
- ✅ **Métriques HTTP** (requêtes, latence, codes de statut)
- ✅ **Métriques métier** (utilisateurs enregistrés, hachage mots de passe)

### Accès aux métriques

```bash
curl http://localhost:4000/metrics
```

Pour une documentation complète des métriques, consultez : **[METRICS.md](./METRICS.md)**

### Configuration Prometheus

```yaml
scrape_configs:
  - job_name: "auth-service"
    static_configs:
      - targets: ["auth-service:4000"]
    metrics_path: "/metrics"
    scrape_interval: 15s
```

## Architecture

- **Express.js** avec TypeScript
- **Passport.js** pour l'authentification
- **PostgreSQL** pour la persistance
- **JWT** pour les tokens
- **bcryptjs** pour le hachage des mots de passe
- **prom-client** pour les métriques Prometheus
