# Déploiement Docker Swarm

Ce guide explique comment déployer votre application en cluster Docker Swarm avec haute disponibilité et résilience.

## Architecture du Cluster

### Services et Réplicas

- **Bases de données** (Stateful - 1 réplica)
  - PostgreSQL: 1 réplica avec volume persistant
  - Elasticsearch: 1 réplica avec volume persistant

- **Services backend** (Stateless - 2-3 réplicas)
  - NestJS: 3 réplicas (service principal)
  - Auth Service: 2 réplicas
  - Agent IA Service: 2 réplicas
  - Scraping Service: 2 réplicas
  - Sync Service: 1 réplica

- **Frontend** (Stateless - 3 réplicas)
  - Frontend Nuxt: 3 réplicas
  - Nginx Load Balancer: 2 réplicas

- **Monitoring** (1 réplica)
  - Kibana: 1 réplica

### Contraintes de Placement

- **database=true**: Nodes dédiés aux bases de données
- **app=true**: Nodes pour les services backend
- **frontend=true**: Nodes pour le frontend et load balancer
- **monitoring=true**: Nodes pour le monitoring

## Prérequis

1. **Docker Swarm initialisé**
   ```bash
   docker swarm init
   ```

2. **Nodes configurés**
   - Manager node (minimum 1)
   - Worker nodes (recommandé 3+)

3. **Volumes persistants**
   - `/data/postgres` sur les nodes database
   - `/data/elasticsearch` sur les nodes database

4. **Certificats SSL**
   - Placez vos certificats dans `./ssl/cert.pem` et `./ssl/key.pem`

## Installation

### 1. Configuration

Copiez le fichier de configuration:
```bash
cp .env.swarm .env
```

Éditez `.env` avec vos valeurs:
- Mots de passe sécurisés
- Clés API
- Domaines et URLs (déjà configurés pour ualtarh.com)

### 2. Labellisation des Nodes

Configurez les labels sur vos nodes:
```bash
# Manager node (pour databases et monitoring)
docker node update --label-add database=true <manager-node-id>
docker node update --label-add monitoring=true <manager-node-id>

# Worker nodes (pour app et frontend)
docker node update --label-add app=true <worker-node-1-id>
docker node update --label-add frontend=true <worker-node-1-id>
docker node update --label-add app=true <worker-node-2-id>
docker node update --label-add frontend=true <worker-node-2-id>
```

### 3. Déploiement

Utilisez le script automatisé:
```bash
./swarm-deploy.sh deploy
```

Ou manuellement:
```bash
# Créer les secrets
echo "your_postgres_password" | docker secret create postgres_password -

# Déployer le stack
docker stack deploy -c docker-compose.swarm.yml query-forge
```

## Gestion du Cluster

### Commandes Utiles

```bash
# Statut du cluster
./swarm-deploy.sh status

# Mise à jour du stack
./swarm-deploy.sh update

# Surveillance
./swarm-monitoring.sh monitor

# Rapport de santé
./swarm-monitoring.sh health

# Nettoyage
./swarm-deploy.sh cleanup
```

### Surveillance

Le script de monitoring `swarm-monitoring.sh` fournit:
- Surveillance continue des services
- Vérification des ressources
- Tests de connectivité
- Alertes en cas de problème
- Sauvegarde des métriques

### Logs

```bash
# Logs d'un service
docker service logs -f query-forge_nestjs

# Logs avec le script
./swarm-deploy.sh logs nestjs
```

## Haute Disponibilité

### Résilience

- **Rolling updates**: Mise à jour sans interruption
- **Health checks**: Vérification automatique de la santé
- **Auto-restart**: Redémarrage automatique en cas d'échec
- **Load balancing**: Distribution automatique du trafic

### Sauvegardes

Les volumes persistants sont configurés pour:
- PostgreSQL: `/data/postgres`
- Elasticsearch: `/data/elasticsearch`

Planifiez des sauvegardes régulières de ces répertoires.

## Sécurité

### Réseaux

- **backend-network**: Communication entre services backend
- **frontend-network**: Communication frontend-backend
- **monitoring-network**: Réseau isolé pour le monitoring

### Secrets

Les mots de passe sont gérés via Docker Secrets:
- `postgres_password`: Mot de passe PostgreSQL

### SSL/TLS

Nginx est configuré pour:
- Redirection HTTP vers HTTPS
- Certificats TLS 1.2/1.3
- Compression Gzip

## Monitoring

### Endpoints de Santé

- **Frontend**: `https://query-forge-dev.ualtarh.com`
- **API**: `https://api.ualtarh.com`
- **Auth**: `https://auth.ualtarh.com`
- **Agent IA**: `https://agent.ualtarh.com`
- **Scraping**: `https://scraping.ualtarh.com`
- **Adminer**: `https://adminer.ualtarh.com`
- **Kibana**: `https://kibana.ualtarh.com`

### Métriques

- Utilisation CPU/mémoire
- Statut des services
- Logs d'erreurs
- Connectivité réseau

## Dépannage

### Problèmes Courants

1. **Services ne démarrent pas**
   ```bash
   docker service ps query-forge_<service> --no-trunc
   ```

2. **Problèmes de réseau**
   ```bash
   docker network inspect query-forge_backend-network
   ```

3. **Volumes non montés**
   ```bash
   docker volume ls
   docker volume inspect query-forge_postgres-data
   ```

### Debug

```bash
# Inspection d'un service
docker service inspect query-forge_nestjs

# Logs détaillés
docker service logs --raw query-forge_nestjs

# Événements du système
docker system events --since 1h
```

## Performance

### Optimisations

- **Resource limits**: Limites mémoire configurées
- **Placement constraints**: Services sur nodes appropriés
- **Health checks**: Détection rapide des problèmes
- **Load balancing**: Distribution du trafic

### Scaling

```bash
# Augmenter les réplicas
docker service scale query-forge_nestjs=5

# Réduire les réplicas
docker service scale query-forge_nestjs=2
```

## Mise à Jour

### Rolling Update

```bash
# Mise à jour d'un service
docker service update --image new-image:tag query-forge_nestjs

# Rollback
docker service rollback query-forge_nestjs
```

### Maintenance

```bash
# Drain un node (maintenance)
docker node update --availability drain <node-id>

# Remettre en service
docker node update --availability active <node-id>
```

## Support

Pour toute question ou problème:
1. Consultez les logs avec `./swarm-monitoring.sh`
2. Vérifiez le statut avec `./swarm-deploy.sh status`
3. Consultez la documentation Docker Swarm