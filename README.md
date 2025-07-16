# 🔍 QueryForge - Plateforme Intelligente de Recherche de Contenus Développement

## 📝 Description du Projet

**QueryForge** est une plateforme intelligente de recherche de contenus éducatifs sur le développement informatique. Le projet permet aux utilisateurs de rechercher des **vidéos, articles et ressources** en utilisant des **requêtes en langage naturel** avec des **agents IA avancés**.

### 🎯 Fonctionnalités Principales

- **🤖 Recherche intelligente** : Saisie de requêtes en langage naturel avec agents IA
- **🔄 Streaming temps réel** : Réponses IA en streaming avec Server-Sent Events
- **🧠 Agents IA avancés** : Traitement des requêtes avec LangGraph et OpenAI
- **🌐 Sources multiples** : Indexation de contenus depuis YouTube, Stack Overflow, TikTok
- **🕷️ Scraping automatisé** : Récupération de données depuis les sites sans API publique
- **⚡ Synchronisation** : Mise à jour automatique des contenus via des jobs périodiques
- **📊 Monitoring complet** : Observabilité avec Prometheus et Grafana
- **🔐 Sécurité avancée** : SSL automatisé, authentification JWT, network policies
- **📱 Interface moderne** : Interface utilisateur intuitive et responsive

---

## 🏗️ Architecture Microservices

Le projet suit une **architecture microservices moderne** avec monitoring et observabilité complète :

### 📦 Services Backend

| Service              | Port | Technologie        | Fonctionnalité                   | Métriques     |
| -------------------- | ---- | ------------------ | -------------------------------- | ------------- |
| **query-forge-dev**  | 3000 | NestJS + TypeORM   | API principale, gestion métier   | ✅ `/metrics` |
| **auth-service**     | 4000 | Express + JWT      | Authentification et autorisation | ✅ `/metrics` |
| **agent-ia-service** | 8088 | LangGraph + OpenAI | Traitement IA des requêtes       | ✅ `/metrics` |
| **scraping-service** | 3001 | Puppeteer          | Scraping de contenus web         | ✅ `/metrics` |
| **sync-service**     | 3333 | TypeScript         | Synchronisation APIs externes    | ✅ `/metrics` |

### 🖥️ Frontend & Infrastructure

| Service           | Port   | Technologie         | Fonctionnalité                |
| ----------------- | ------ | ------------------- | ----------------------------- |
| **frontend**      | 4444   | Nuxt.js 3 + Vue.js  | Interface utilisateur         |
| **postgres**      | 5432   | PostgreSQL 17.4     | Base de données relationnelle |
| **elasticsearch** | 9200   | Elasticsearch 9.0.0 | Moteur de recherche           |
| **kibana**        | 5601   | Kibana 9.0.0        | Interface Elasticsearch       |
| **nginx**         | 80/443 | Nginx               | Reverse proxy + SSL/TLS       |

### 📊 Monitoring & Observabilité

| Service           | Port | Technologie   | Fonctionnalité              |
| ----------------- | ---- | ------------- | --------------------------- |
| **prometheus**    | 9090 | Prometheus    | Collecte de métriques       |
| **grafana**       | 3001 | Grafana       | Tableaux de bord monitoring |
| **node-exporter** | 9100 | Node Exporter | Métriques système           |

---

## 🛠️ Technologies Utilisées

### Frontend

- **Nuxt.js 3** - Framework Vue.js full-stack
- **Vue.js** - Framework JavaScript progressif
- **TailwindCSS** - Framework CSS utilitaire
- **Pinia** - Gestion d'état pour Vue.js
- **TypeScript** - Superset typé de JavaScript
- **Architecture Layers** - Modularité avec couches admin/app/base/ui

### Backend

- **NestJS** - Framework Node.js progressif avec TypeORM
- **Express.js** - Framework web minimaliste
- **TypeScript** - Langage de programmation typé
- **JWT** - Authentification stateless avec refresh tokens

### Intelligence Artificielle

- **LangGraph** - Framework d'agents IA pour workflows complexes
- **OpenAI GPT** - Modèles de langage pour traitement des requêtes
- **Server-Sent Events** - Streaming temps réel des réponses IA
- **Elasticsearch Tools** - Intégration native pour recherche sémantique

### Base de Données & Recherche

- **PostgreSQL 17.4** - Base de données relationnelle
- **Elasticsearch 9.0.0** - Moteur de recherche et d'analyse
- **Kibana 9.0.0** - Visualisation des données Elasticsearch

### Infrastructure & DevOps

- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration développement
- **Docker Swarm** - Orchestration production
- **K3s** - Distribution Kubernetes légère (work in progress)
- **Nginx** - Reverse proxy et load balancer
- **Let's Encrypt** - Certificats SSL automatisés
- **Prometheus** - Collecte de métriques
- **Grafana** - Monitoring et alerting

### Infrastructure as Code

- **Terraform** - Provisioning infrastructure Proxmox
- **Ansible** - Configuration automatisée
- **Proxmox** - Virtualisation et conteneurs

---

## 📁 Structure du Projet

```
Projet-S2-5IW/
├── 📂 backend/                    # Microservices backend
│   ├── 📂 query-forge-dev/        # API principale NestJS
│   │   ├── 📂 src/modules/         # Modules métier (users, reports, questions)
│   │   ├── 📂 migrations/          # Migrations TypeORM
│   │   ├── 📂 seeds/               # Données de test
│   │   └── 📄 METRICS.md           # Documentation métriques
│   ├── 📂 auth-service/            # Service d'authentification
│   │   ├── 📂 src/                 # Code source TypeScript
│   │   └── 📄 METRICS.md           # Métriques authentification
│   ├── 📂 agent-ia-service/        # Service IA avec LangGraph
│   │   ├── 📂 Agents/              # Agents IA
│   │   │   └── 📂 translate-for-elk/ # Agent de traitement Elasticsearch
│   │   ├── 📂 serveur/             # Serveur Express avec SSE
│   │   └── 📄 METRICS.md           # Métriques IA
│   ├── 📂 scraping-service/        # Service de scraping Puppeteer
│   │   └── 📄 METRICS.md           # Métriques scraping
│   └── 📂 sync-service/            # Synchronisation APIs externes
│
├── 📂 frontend/                    # Application Nuxt.js 3
│   ├── 📂 layers/                  # Architecture modulaire
│   │   ├── 📂 admin/               # Interface administration
│   │   ├── 📂 app/                 # Application principale
│   │   ├── 📂 base/                # Couche de base
│   │   └── 📂 ui/                  # Composants UI (shadcn-vue)
│   ├── 📂 stores/                  # Stores Pinia
│   ├── 📂 middleware/              # Middlewares Nuxt
│   └── 📂 components/              # Composants Vue
│
├── 📂 conf/                        # Configuration
│   ├── 📄 nginx.conf               # Configuration Nginx avec SSL
│   └── 📄 prometheus.yml           # Configuration monitoring
│
├── 📂 scripts/                     # Scripts d'automatisation
│   ├── 📄 generate-ssl-cert.sh     # Génération certificats SSL Let's Encrypt
│   ├── 📄 renew-ssl-cert.sh        # Renouvellement automatique SSL
│   └── 📄 import-elasticsearch.sh  # Import données Elasticsearch
│
├── 📂 k3s-manifests/               # Déploiement Kubernetes (work in progress)
│   ├── 📂 backend/                 # Manifests services backend
│   ├── 📂 frontend/                # Manifests frontend
│   ├── 📂 databases/               # PostgreSQL + Elasticsearch
│   ├── 📂 monitoring/              # Prometheus + Grafana + Kibana
│   ├── 📂 ingress/                 # Traefik + routing
│   ├── 📂 autoscaling/             # HPA + VPA
│   ├── 📂 security/                # Network policies
│   └── 📂 scripts/                 # Scripts déploiement automatisé
│
├── 📂 proxmox/                     # Infrastructure physique
│   ├── 📂 terraform/               # Infrastructure as Code
│   └── 📂 ansible/                 # Configuration automatisée
│
├── 📄 compose.yaml                 # Docker Compose développement
├── 📄 compose.sync.yaml            # Docker Compose avec sync-service
├── 📄 docker-compose.swarm.yml     # Docker Swarm production
├── 📄 deploy.sh                    # Script de déploiement Swarm
├── 📄 .env                         # Variables d'environnement
├── 📄 contents.json                # Données Elasticsearch
└── 📄 README.md                    # Documentation
```

---

## 🚀 Déploiement & Environnements

### 💻 Développement Local - Docker Compose

#### Prérequis

```bash
# Installer Docker et Docker Compose
# Installer Node.js 18+ et npm/yarn
git clone <repository-url>
cd Projet-S2-5IW
```

#### Configuration environnement

Créez un fichier `.env` avec les variables suivantes :

```bash
# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_USER=query_forge_dev_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=query_forge_dev
POSTGRES_PORT=5432

# NestJS
NEST_PORT=3000
NEST_ENV=development

# Authentication Service
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
AUTH_PORT=4000
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:4444

# Elasticsearch
STACK_VERSION=9.0.0
EL_DISCOVERY_TYPE=single-node
ES_PORT=127.0.0.1:9200
ES_JAVA_OPTS="-Xms1g -Xmx1g"
ELASTICSEARCH_HOSTS=http://elasticsearch:9200

# Kibana
KIBANA_PASSWORD=password
KIBANA_PORT=5601

# Agent IA Service
OPENAI_API_KEY=your_openai_api_key
AGENT_AI_PORT=8088
AGENT_AI_REQUIRE_AUTH=false
AGENT_IA_HOST=http://localhost:8088

# Scraping Service
SCRAPING_SERVICE_PORT=3001
SCRAPER_SERVICE_URL=http://scraping-service:3001
SCRAPER_LOCAL_URL=http://localhost:3001

# Sync Service
YOUTUBE_API_KEY=your_youtube_api_key
APIFY_API_TOKEN=your_apify_token
SYNC_PORT=3333

# Frontend
NUXT_HOST=0.0.0.0
NUXT_PORT=4444
AUTH_BASE_URL=http://localhost:4000
NEST_BASE_URL=http://nestjs:3000
NEST_LOCAL_URL=http://localhost:3000

# Variables publiques frontend (pour production)
NUXT_PUBLIC_AI_API_URL=https://agent.mapa-server.org
NUXT_PUBLIC_NEST_BASE_URL=https://api.mapa-server.org
NUXT_PUBLIC_AUTH_BASE_URL=https://auth.mapa-server.org
NUXT_PUBLIC_SCRAPER_URL=https://scraping.mapa-server.org
```

#### Démarrage des services

```bash
# Démarrer tous les services
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Migrations et seeds
docker exec -it nestjs-query-forge-dev sh -c "cd /app && npm run migration:run"
docker exec -it nestjs-query-forge-dev sh -c "cd /app && npm run seed"

# Import données Elasticsearch
cd scripts/
./import-elasticsearch.sh localhost:9200 ../contents.json
```

### 🐳 Production - Docker Swarm

#### Configuration SSL et déploiement

```bash
# 1. Cloner le projet
git clone <repository-url>
cd Projet-S2-5IW

# 2. Configurer .env pour production (domaines mapa-server.org)

# 3. Générer certificats SSL
cd scripts/
./generate-ssl-cert.sh

# 4. Initialiser Docker Swarm
docker swarm init

# 5. Déployer la stack
./deploy.sh
```

#### Surveillance et debug

```bash
# Vérifier l'état général
sudo docker stack ls
sudo docker service ls
sudo docker node ls

# Vérifier les services
sudo docker service ps query-forge-dev_nginx --no-trunc
sudo docker service logs query-forge-dev_nestjs

# Redémarrer un service si nécessaire
sudo docker service update --force query-forge-dev_frontend
```

#### Import données Elasticsearch

```bash
# Transformer le fichier pour format bulk
sed 's/^/{"index":{"_index":"contents"}}\n/' contents.json > contents_bulk.json

# Importer
curl -X POST "localhost:9200/_bulk" \
  -H "Content-Type: application/x-ndjson" \
  --data-binary @contents_bulk.json

# Vérifier
curl "localhost:9200/contents/_count"
```

#### Accès aux services

- **🌐 Application** : https://query-forge-dev.mapa-server.org
- **📊 Grafana** : https://grafana.mapa-server.org (admin/admin123)
- **🔍 Kibana** : https://kibana.mapa-server.org
- **📈 Prometheus** : https://prometheus.mapa-server.org
- **🗄️ Adminer** : https://adminer.mapa-server.org

### ☸️ Production Avancée - Kubernetes (K3s) [Work in Progress]

> **Note**: L'architecture Kubernetes est fonctionnelle dans l'esprit mais encore en développement. Elle inclut tous les composants nécessaires pour une production scalable.

#### Infrastructure Proxmox

```bash
# 1. Provisioning avec Terraform
cd proxmox/terraform
terraform init
terraform plan -out=./tf.plan
terraform apply -auto-approve tf.plan
./generate_inventory.sh

# 2. Configuration avec Ansible
cd ../ansible
ansible-playbook database-setup.yml --vault-password-file group_vars/all/.vault_pass.txt
ansible-playbook playbook.yml --vault-password-file group_vars/all/.vault_pass.txt
```

#### Déploiement K3s

```bash
# Sur le master K3s
cd k3s-manifests/

# Build et déploiement
./scripts/build-images.sh
./scripts/deploy.sh

# Surveillance
kubectl get pods -n query-forge
kubectl logs -f deployment/nestjs -n query-forge
kubectl top nodes
```

#### Fonctionnalités K3s

- **🔄 Autoscaling** : HPA et VPA configurés
- **📊 Monitoring** : Prometheus + Grafana intégrés
- **🌐 Ingress** : Traefik avec SSL automatique
- **🔒 Sécurité** : Network policies et secrets
- **💾 Databases** : PostgreSQL et Elasticsearch configurés

---

## 📊 Monitoring et Observabilité

### 🎯 Métriques par Service

Chaque microservice expose des métriques détaillées sur `/metrics` :

- **📈 Performances** : Latence, throughput, durées d'opération
- **🔄 Santé** : Status des services, connexions base de données
- **🚨 Erreurs** : Taux d'erreur, codes de statut HTTP
- **👥 Utilisation** : Nombre d'utilisateurs, requêtes par minute

### 📊 Configuration Grafana

```bash
# Accès Grafana
https://grafana.mapa-server.org
Login: admin / admin123

# Ajouter Prometheus
Configuration → Data Sources → Add data source
URL: http://prometheus:9090

# Dashboards recommandés
- 11159 : Node.js Application Dashboard
- 12486 : Node.js Metrics
- 893 : Docker and system monitoring
- 1860 : Node Exporter Full
```

---

## 🔐 Sécurité

### 🛡️ Authentification & Autorisation

- **JWT** avec refresh tokens et expiration configurable
- **Validation** des données avec DTOs TypeScript
- **Chiffrement** des mots de passe avec bcrypt
- **CORS** configuré pour domaines autorisés
- **Rate limiting** sur les APIs

### 🔒 Infrastructure

- **SSL/TLS** automatisé avec Let's Encrypt
- **Network policies** Kubernetes pour isolation
- **Secrets** gérés séparément des configurations
- **Reverse proxy** Nginx avec headers sécurisés

---

## ⚡ Performance & Scalabilité

### 🚀 Optimisations

- **Indexation Elasticsearch** optimisée pour recherche sémantique
- **Streaming SSE** pour réponses IA temps réel
- **Load balancing** avec Nginx upstream
- **Caching** intelligent au niveau service

### 📈 Scalabilité

- **Réplication** services critiques (auth: 2, nestjs: 2, agent: 2)
- **Auto-scaling** HPA/VPA sur Kubernetes
- **Monitoring proactif** avec alertes Grafana
- **Resource limits** configurés par service

---

## 🛠️ Commandes Utiles

### 🔧 Développement

```bash
# Reconstruction service spécifique
docker-compose build nestjs && docker-compose up -d nestjs

# Accès aux conteneurs
docker-compose exec nestjs sh
docker-compose exec postgres psql -U query_forge -d query_forge_db

# Logs spécifiques
docker-compose logs -f nestjs
docker-compose logs -f elasticsearch

# Nettoyage
docker-compose down -v && docker system prune -f
```

### 🐳 Production Swarm

```bash
# Redéploiement complet
sudo docker stack rm query-forge-dev
./deploy.sh

# Mise à jour service
sudo docker service update --image mathieuvss/query-forge-frontend:latest query-forge-dev_frontend

# Renouvellement SSL
cd scripts/ && ./renew-ssl-cert.sh
```

---

## 💡 Équipe de Développement

- **Mathieu Pannetrat** - Développeur Full-Stack & DevOps
- **Gauthier Lo** - Développeur Full-Stack
- **Jean-Paul Hayek** - Développeur Full-Stack

---

## 📊 Évolution du Projet

### ✅ Fonctionnalités Récentes

- **🤖 Agents IA avancés** avec LangGraph et streaming
- **📊 Monitoring complet** Prometheus + Grafana
- **🔐 SSL automatisé** avec Let's Encrypt
- **🐳 Docker Swarm** production-ready
- **🏗️ Infrastructure as Code** Terraform + Ansible

### 🚧 Work in Progress

- **☸️ Kubernetes (K3s)** - Architecture complète fonctionnelle
- **📱 Interface mobile** optimisée
- **🔄 CI/CD Pipeline** avec GitHub Actions
- **🌍 Multi-région** deployment

---

## 📄 Licence

Ce projet est développé dans le cadre académique ESGI.

---

**🔍 QueryForge - Intelligence Artificielle au service de la recherche de contenus développement**
