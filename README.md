# 🔍 QueryForge - Plateforme de Recherche de Contenus Développement

## 📝 Description du Projet

**QueryForge** est une plateforme intelligente de recherche de contenus éducatifs sur le développement informatique. Le projet permet aux utilisateurs de rechercher des **vidéos, articles et ressources** en utilisant des **requêtes en langage naturel**.

### 🎯 Fonctionnalités Principales

- **Recherche intelligente** : Saisie de requêtes en langage naturel
- **Analyse IA** : Traitement des requêtes avec OpenAI pour extraire les mots-clés pertinents pour ensuite les exécuter sur Elasticsearch
- **Sources multiples** : Indexation de contenus depuis YouTube, Stack Overflow, TikTok
- **Scraping automatisé** : Récupération de données depuis les sites sans API publique
- **Synchronisation** : Mise à jour automatique des contenus via des jobs périodiques
- **Interface moderne** : Interface utilisateur intuitive et responsive

---

## 🏗️ Architecture & Microservices

Le projet suit une **architecture microservices** avec les composants suivants :

### 📦 Services Backend

| Service              | Description                        | Port | Technologie          |
| -------------------- | ---------------------------------- | ---- | -------------------- |
| **query-forge-dev**  | API principale, gestion métier     | 3000 | NestJS + TypeScript  |
| **auth-service**     | Authentification et autorisation   | 4000 | Node.js + Express    |
| **agent-ia-service** | Traitement IA des requêtes         | 8088 | Node.js + LangGraph  |
| **scraping-service** | Service de scraping de contenus    | 3001 | Node.js + Puppeteer  |
| **sync-service**     | Synchronisation avec APIs externes | 3333 | Node.js + TypeScript |

### 🖥️ Services Frontend & Infrastructure

| Service           | Description                   | Port | Technologie      |
| ----------------- | ----------------------------- | ---- | ---------------- |
| **frontend**      | Interface utilisateur         | 4444 | Nuxt.js + Vue.js |
| **postgres**      | Base de données relationnelle | 5432 | PostgreSQL 17.4  |
| **elasticsearch** | Moteur de recherche           | 9200 | Elasticsearch    |
| **kibana**        | Interface Elasticsearch       | 5601 | Kibana           |
| **adminer**       | Interface base de données     | 8080 | Adminer          |

---

## 🛠️ Technologies Utilisées

### Frontend

- **Nuxt.js 3** - Framework Vue.js full-stack
- **Vue.js** - Framework JavaScript progressif
- **TailwindCSS** - Framework CSS utilitaire
- **Pinia** - Gestion d'état pour Vue.js
- **TypeScript** - Superset typé de JavaScript

### Backend

- **NestJS** - Framework Node.js progressif
- **Node.js** - Runtime JavaScript
- **TypeScript** - Langage de programmation typé
- **Express.js** - Framework web minimaliste
- **TypeORM** - ORM pour TypeScript/JavaScript

### Base de Données & Recherche

- **PostgreSQL** - Base de données relationnelle
- **Elasticsearch** - Moteur de recherche et d'analyse
- **Kibana** - Visualisation des données Elasticsearch

### Intelligence Artificielle

- **Agents IA** - Système d'agents pour l'analyse de requêtes avec LangGraph

### Infrastructure & DevOps

- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration de conteneurs
- **K3s** - Distribution Kubernetes légère
- **Traefik** - Reverse proxy et load balancer
- **Grafana** - Monitoring et alerting
- **Prometheus** - Collecte de métriques

---

## 📁 Structure du Projet

```
Projet-S2-5IW/
├── 📂 backend/                    # Services backend
│   ├── 📂 query-forge-dev/        # API principale NestJS
│   │   ├── 📂 src/
│   │   │   ├── 📂 modules/         # Modules métier
│   │   │   ├── 📂 migrations/      # Migrations base de données
│   │   │   └── 📂 seeds/           # Données de test
│   │   └── 📄 package.json
│   ├── 📂 auth-service/            # Service d'authentification
│   ├── 📂 agent-ia-service/        # Service IA
│   ├── 📂 scraping-service/        # Service de scraping
│   └── 📂 sync-service/            # Service de synchronisation
│
├── 📂 frontend/                    # Application Nuxt.js
│   ├── 📂 layers/                  # Architecture en couches
│   │   ├── 📂 admin/               # Interface administration
│   │   ├── 📂 app/                 # Application principale
│   │   ├── 📂 base/                # Couche de base
│   │   └── 📂 ui/                  # Composants UI
│   ├── 📂 components/              # Composants Vue
│   ├── 📂 stores/                  # Stores Pinia
│   └── 📂 middleware/              # Middlewares Nuxt
│
├── 📂 k3s-manifests/               # Déploiement Kubernetes
│   ├── 📂 backend/                 # Manifests services backend
│   ├── 📂 frontend/                # Manifests frontend
│   ├── 📂 databases/               # Manifests bases de données
│   ├── 📂 monitoring/              # Monitoring (Grafana, Prometheus)
│   └── 📂 ingress/                 # Configuration ingress
│
├── 📂 proxmox/                     # Infrastructure Proxmox
│   ├── 📂 terraform/               # Infrastructure as Code
│   └── 📂 ansible/                 # Configuration automatisée
│
├── 📄 compose.yaml                 # Docker Compose développement
├── 📄 compose.prod.yaml            # Docker Compose production
└── 📄 README.md                    # Documentation
```

---

## 🚀 Commandes de Développement

### 🔧 Prérequis

```bash
# Installer Docker et Docker Compose
# Installer Node.js 18+ et npm/yarn
# Cloner le repository
git clone <repository-url>
cd Projet-S2-5IW
```

### 💻 Environnement de Développement

Au préalable, il faut créer un fichier .env dans la racine du projet avec les variables d'environnement suivantes :(plus trop à jour il me semble)

```bash
POSTGRES_HOST=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=

#nestjs
NEST_PORT=
NEST_ENV=

#auth service
JWT_SECRET=
JWT_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=
AUTH_PORT=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=


#elastic
STACK_VERSION=
EL_DISCOVERY_TYPE=
ES_PORT=
ES_JAVA_OPTS=

#kibana
KIBANA_PASSWORD=
KIBANA_PORT=
ELASTICSEARCH_HOSTS=

#sync service
YOUTUBE_API_KEY=
APIFY_API_TOKEN=
SYNC_PORT=

#agent ia
OPENAI_API_KEY=
AGENT_AI_PORT=
AGENT_AI_REQUIRE_AUTH=
AGENT_IA_HOST=

#scraping service
SCRAPING_SERVICE_PORT=
SCRAPER_SERVICE_URL=
SCRAPER_LOCAL_URL=

# Frontend
NUXT_HOST=
NUXT_PORT=
AUTH_BASE_URL=
NEST_BASE_URL=
NEST_LOCAL_URL=
```

#### Démarrage de tous les services

```bash
# Démarrer tous les services en mode développement
docker-compose up -d --build

# Voir les logs en temps réel
docker-compose logs -f

# Lancer les migrations
docker exec -it nestjs-query-forge-dev sh -c "cd /app && npm run migration:run"

# Seeder la base de données
docker exec -it nestjs-query-forge-dev sh -c "cd /app && npm run seed"

# Lancer le script pour ajouter de la donnée dans la base de données elasticsearch préalablement créée via le sync service sur notre ancien serveur
cd scripts/
./import-elasticsearch.sh localhost:9200 ../contents.json

# Pour créer une nouvelle migration
docker exec -it nestjs-query-forge-dev sh -c "cd /app && npm run migration:generate"

# Pour lancer les migrations
docker exec -it nestjs-query-forge-dev sh -c "cd /app && npm run migration:run"

# docker l'on veut tester le service sync
docker compose -f compose.prod.yaml up -d --build
```

### 🛠️ Commandes Utiles de Développement

```bash
# Reconstruire un service spécifique
docker-compose build nestjs
docker-compose up -d nestjs

# Accéder au shell d'un conteneur
docker-compose exec nestjs sh
docker-compose exec postgres psql -U query_forge -d query_forge_db

# Voir les logs d'un service spécifique
docker-compose logs -f nestjs
docker-compose logs -f elasticsearch

# Nettoyer les volumes et containers
docker-compose down -v
docker system prune -f
```

---

## 🚀 Déploiement Production

### ☸️ Production avec Kubernetes (K3s)

#### Installation des VMS pour kubernetes (le faire sur un serveur proxmox) + les lxc pour les base de données elasticsearch et postgres.

# Terraform

## Instructions

```bash
cd terraform
terraform init # init
terraform plan -out=./tf.plan # utilise la config dans un fichier tf.plan
terraform apply -auto-approve tf.plan # applique la config pour créer les vm et tout
./generate_inventory.sh # lance un script pour générer un fichier hosts.ini avec des datas à feed comme les IPs des VM créées Ansible
```

# Ansible

## Instruction

Apres avoir déployé les LXC via Terraform, lancer la commande suivant pour installer les base de données :

```bash
cd ../ansible
ansible-playbook database-setup.yml --vault-password-file group_vars/all/.vault_pass.txt

# pour vérifier l'installation de Postgres
ssh root@192.168.1.142
systemctl status postgresql
sudo -u postgres psql -c 'SELECT version();'
netstat -tlnp | grep 5432
tail -20 /var/log/postgresql/postgresql-16-main.log

# pour vérifier l'installation de ElasticSearch
ssh root@192.168.1.144
systemctl status elasticsearch
# version et cluster health
curl -X GET 'localhost:9200/_cluster/health?pretty'
# vérification du port
netstat -tlnp | grep 9200
# logs
tail -20 /var/log/elasticsearch/queryforge-cluster.log
```

Après avoir déployé les VM via Terraform, lancer la commande suivant pour installer k3s dans les VMs en fonction du role de la VM :

```bash
cd ../ansible
ansible-playbook playbook.yml --vault-password-file group_vars/all/.vault_pass.txt
```

#### Déploiement sur K3s

Aller sur la VM k3s master et lancer les commandes suivantes :

```bash
cd k3s-manifests/

# Build les images
./scripts/build-images.sh

# Lancer le script de déploiement
./scripts/deploy.sh

```

#### Accès aux Interfaces

- **query-forge-dev.ualtarh.com** # frontend
- **api.ualtarh.com** # nestjs
- **auth.ualtarh.com** # auth-service
- **agent.ualtarh.com** # agent-ia-service
- **scraping.ualtarh.com** # scraping-service
- **adminer.ualtarh.com** # adminer
- **kibana.ualtarh.com** # kibana
- **grafana.ualtarh.com** # grafana
- **traefik.ualtarh.com** # traefik dashboard

#### Commandes de Monitoring

```bash
# Vérifier le statut des pods
kubectl get pods -n query-forge

# Voir les logs d'un service
kubectl logs -f deployment/nestjs -n query-forge

# Vérifier les métriques
kubectl top nodes
kubectl top pods -n query-forge
```

---

## 🔐 Sécurité

- **Authentification JWT** avec refresh tokens
- **Validation des données** avec des DTOs TypeScript
- **Chiffrement des mots de passe** avec bcrypt
- **CORS** configuré pour les domaines autorisés
- **Rate limiting** sur les APIs
- **Network policies** Kubernetes pour l'isolation

---

## 📊 Performance

- **Indexation Elasticsearch** optimisée
- **Auto-scaling** avec HPA/VPA sur Kubernetes

---

## 💡 Équipe de Développement

- **Mathieu Pannetrat** - Développeur Full-Stack
- **Gauthier Lo** - Développeur Full-Stack
- **Jean-Paul Hayek** - Développeur Full-Stack

---

## 📄 Licence

Ce projet est sous licence je sais pas quoi.

---
