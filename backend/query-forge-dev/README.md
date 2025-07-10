# Query Forge Dev API

API backend développée avec NestJS pour la gestion des questions, utilisateurs, sources de contenu et usages de questions.

## Fonctionnalités

- 🔐 **Authentification** avec JWT et guards personnalisés
- 👥 **Gestion des utilisateurs** avec rôles et permissions
- ❓ **Gestion des questions** CRUD complète
- 📚 **Sources de contenu** configurables
- 📊 **Suivi des usages** de questions
- 🌐 **API REST** avec documentation Swagger
- 📈 **Métriques Prometheus** intégrées
- 🗄️ **Base de données PostgreSQL** avec TypeORM

## Architecture

L'application suit l'architecture modulaire de NestJS :

```
src/
├── common/                 # Éléments partagés
│   ├── decorator/         # Décorateurs personnalisés
│   ├── guard/            # Guards d'authentification
│   └── interceptors/     # Intercepteurs (métriques)
├── modules/              # Modules fonctionnels
│   ├── users/           # Gestion des utilisateurs
│   ├── questions/       # Gestion des questions
│   ├── content-sources/ # Sources de contenu
│   ├── question-usages/ # Usages des questions
│   └── metrics/         # Métriques Prometheus
└── seeds/               # Données de test
```

## Installation

```bash
# Installer les dépendances
npm install

# Variables d'environnement
cp .env.example .env
```

## Configuration

Créer un fichier `.env` avec les variables suivantes :

```env
# Base de données
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=query_forge_dev

# Serveur
NEST_PORT=3000

# JWT (optionnel)
JWT_SECRET=your_jwt_secret
```

## Lancement de l'application

```bash
# Mode développement
npm run start:dev

# Mode production
npm run start:prod

# Mode debug
npm run start:debug
```

## Endpoints principaux

- **API Documentation** : `http://localhost:3000/api`
- **Health Check** : `http://localhost:3000/health`
- **Métriques Prometheus** : `http://localhost:3000/metrics`

### API Routes

- `GET|POST /users` - Gestion des utilisateurs
- `GET|POST|PUT|DELETE /questions` - Gestion des questions
- `GET|POST|PUT|DELETE /content-sources` - Sources de contenu
- `GET|POST|PUT|DELETE /question-usages` - Usages des questions

## Monitoring et métriques

L'application expose des métriques Prometheus sur `/metrics` :

### Métriques disponibles

- **HTTP** : Requêtes, latence, codes de statut
- **Base de données** : Opérations, durée, erreurs
- **Métier** : Questions, utilisateurs, sources

### Configuration Prometheus

```yaml
scrape_configs:
  - job_name: 'query-forge-dev'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

Pour plus de détails, consultez [METRICS.md](./METRICS.md).

## Base de données

### Migration et seeding

```bash
# Seed de base de données avec des données de test
npm run seed
```

### Entités

- **User** : Utilisateurs avec rôles
- **Question** : Questions par technologie
- **ContentSource** : Sources de contenu configurables
- **QuestionUsage** : Suivi des usages de questions

## Tests

```bash
# Tests unitaires
npm run test

# Tests end-to-end
npm run test:e2e

# Couverture de code
npm run test:cov
```

## Développement

### Structure des modules

Chaque module suit la structure NestJS standard :

- `*.controller.ts` - Contrôleur REST
- `*.service.ts` - Logique métier
- `*.repository.ts` - Accès aux données
- `entities/*.entity.ts` - Entités TypeORM
- `dto/*.dto.ts` - DTOs de validation

### Ajout d'un nouveau module

```bash
# Générer un module complet
nest g resource module-name

# Générer seulement un service
nest g service module-name
```

## Déploiement

### Docker

```bash
# Build
docker build -t query-forge-dev .

# Run
docker run -p 3000:3000 query-forge-dev
```

### Variables d'environnement de production

```env
NODE_ENV=production
NEST_PORT=3000
POSTGRES_HOST=your_db_host
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
```

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les modifications (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request
