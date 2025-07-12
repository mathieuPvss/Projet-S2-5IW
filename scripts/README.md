# 🔄 Scripts de Migration Elasticsearch

Ce répertoire contient les scripts nécessaires pour migrer vos données Elasticsearch depuis votre environnement Docker vers votre LXC Elasticsearch.

## 📋 Vue d'ensemble

La migration des données Elasticsearch se fait en plusieurs étapes :

1. **Export des données** depuis votre container Docker
2. **Import des données** vers votre LXC Elasticsearch
3. **Validation** de la migration
4. **Nettoyage** (optionnel)

## 🛠️ Scripts disponibles

### 1. `export-elasticsearch.sh`

Export des données depuis Elasticsearch (Docker)

**Utilisation :**

```bash
./export-elasticsearch.sh [method]
```

**Méthodes disponibles :**

- `elasticdump` (recommandé) - Utilise l'outil elasticdump
- `snapshot` - Utilise les snapshots Elasticsearch
- `curl` - Export simple avec curl

### 2. `import-elasticsearch.sh`

Import des données vers Elasticsearch (LXC)

**Utilisation :**

```bash
./import-elasticsearch.sh [method] [backup_dir]
```

### 3. `migrate-elasticsearch.sh`

Script d'orchestration complète (export + import + validation)

**Utilisation :**

```bash
./migrate-elasticsearch.sh [method]
```

## 🚀 Migration rapide (Recommandé)

### Étape 1 : Préparation

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh

# Vérifier que votre LXC Elasticsearch est démarré
ping 192.168.1.44
```

### Étape 2 : Migration complète

```bash
# Migration avec elasticdump (recommandé)
./scripts/migrate-elasticsearch.sh elasticdump

# Ou avec une IP LXC différente
LXC_IP=192.168.1.50 ./scripts/migrate-elasticsearch.sh elasticdump
```

### Étape 3 : Validation

```bash
# Exécuter le script de validation généré
./scripts/validate-migration.sh
```

## 📝 Migration manuelle

Si vous préférez contrôler chaque étape :

### 1. Export depuis Docker

```bash
# Export avec elasticdump
./scripts/export-elasticsearch.sh elasticdump

# Export avec snapshot
./scripts/export-elasticsearch.sh snapshot

# Export avec curl
./scripts/export-elasticsearch.sh curl
```

### 2. Import vers LXC

```bash
# Import avec elasticdump
ELASTICSEARCH_HOST=192.168.1.44:9200 ./scripts/import-elasticsearch.sh elasticdump

# Import avec snapshot
ELASTICSEARCH_HOST=192.168.1.44:9200 ./scripts/import-elasticsearch.sh snapshot
```

## 🔧 Configuration

### Variables d'environnement

| Variable             | Description               | Défaut                   |
| -------------------- | ------------------------- | ------------------------ |
| `ELASTICSEARCH_HOST` | Host Elasticsearch source | `localhost:9200`         |
| `LXC_IP`             | IP du LXC Elasticsearch   | `192.168.1.44`           |
| `BACKUP_DIR`         | Répertoire de sauvegarde  | `./elasticsearch-backup` |

### Exemples de configuration

```bash
# Export depuis un host différent
ELASTICSEARCH_HOST=192.168.1.100:9200 ./scripts/export-elasticsearch.sh elasticdump

# Import vers un LXC différent
LXC_IP=192.168.1.50 ./scripts/import-elasticsearch.sh elasticdump

# Migration complète avec IP personnalisée
LXC_IP=192.168.1.50 ./scripts/migrate-elasticsearch.sh elasticdump
```

## 🔍 Méthodes de migration

### 1. Elasticdump (Recommandé)

- **Avantages** : Simple, fiable, supporte tous les types de données
- **Inconvénients** : Nécessite Node.js/npm
- **Utilisation** : Idéal pour la plupart des cas

### 2. Snapshot

- **Avantages** : Méthode native, très performante
- **Inconvénients** : Nécessite un système de fichiers partagé
- **Utilisation** : Idéal pour de gros volumes de données

### 3. Curl

- **Avantages** : Pas de dépendances externes
- **Inconvénients** : Limité pour de gros volumes
- **Utilisation** : Idéal pour des tests ou de petites quantités

## 🧪 Validation

### Vérifications automatiques

Le script de validation vérifie :

- ✅ Connectivité aux deux instances
- ✅ Nombre de documents
- ✅ Structure des index
- ✅ Mappings des champs
- ✅ Fonctionnalité de recherche

### Vérifications manuelles

```bash
# Vérifier le nombre de documents
curl -s "http://localhost:9200/contents/_count" | jq '.count'
curl -s "http://192.168.1.44:9200/contents/_count" | jq '.count'

# Vérifier la structure des index
curl -s "http://localhost:9200/_cat/indices?v"
curl -s "http://192.168.1.44:9200/_cat/indices?v"

# Test de recherche
curl -s "http://localhost:9200/contents/_search?q=javascript&size=1" | jq '.hits.total'
curl -s "http://192.168.1.44:9200/contents/_search?q=javascript&size=1" | jq '.hits.total'
```

## 🚨 Dépannage

### Problèmes courants

#### 1. "Container Elasticsearch non trouvé"

```bash
# Vérifier les containers en cours
docker ps

# Démarrer Elasticsearch
docker-compose up -d elasticsearch

# Attendre le démarrage
sleep 30
```

#### 2. "LXC Elasticsearch non accessible"

```bash
# Vérifier la connectivité
ping 192.168.1.44

# Vérifier le service Elasticsearch sur le LXC
ssh root@192.168.1.44 "systemctl status elasticsearch"

# Redémarrer le service si nécessaire
ssh root@192.168.1.44 "systemctl restart elasticsearch"
```

#### 3. "elasticdump non trouvé"

```bash
# Installer elasticdump
npm install -g elasticdump

# Ou utiliser une autre méthode
./scripts/export-elasticsearch.sh snapshot
```

#### 4. "Nombre de documents différent"

```bash
# Attendre l'indexation complète
sleep 60

# Forcer le refresh des index
curl -X POST "http://192.168.1.44:9200/_refresh"

# Vérifier à nouveau
./scripts/validate-migration.sh
```

### Logs détaillés

```bash
# Activer les logs détaillés
set -x

# Exécuter avec debug
bash -x ./scripts/migrate-elasticsearch.sh elasticdump
```

## 📊 Structure des données

### Index "contents"

```json
{
  "mappings": {
    "properties": {
      "source": { "type": "keyword" },
      "source_id": { "type": "keyword" },
      "url": { "type": "keyword" },
      "title": { "type": "text" },
      "description": { "type": "text" },
      "thumbnail": { "type": "keyword" },
      "channel": { "type": "keyword" },
      "published_at": { "type": "date" },
      "language": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "origin_question": { "type": "text" },
      "created_at": { "type": "date" }
    }
  }
}
```

## 🔒 Sécurité

### Bonnes pratiques

- ✅ Vérifiez les permissions des scripts
- ✅ Utilisez des connexions sécurisées quand possible
- ✅ Sauvegardez vos données avant migration
- ✅ Testez sur un environnement de développement

### Nettoyage

```bash
# Supprimer les fichiers de sauvegarde
rm -rf ./elasticsearch-backup

# Nettoyer les scripts temporaires
rm -f ./scripts/validate-migration.sh
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs détaillés
2. Consultez la section dépannage
3. Validez votre configuration réseau
4. Vérifiez les permissions et services

## 🎯 Exemples d'utilisation

### Cas d'usage 1 : Migration développement → production

```bash
# Export depuis l'environnement Docker de développement
ELASTICSEARCH_HOST=localhost:9200 ./scripts/export-elasticsearch.sh elasticdump

# Import vers le LXC de production
LXC_IP=192.168.1.44 ./scripts/import-elasticsearch.sh elasticdump
```

### Cas d'usage 2 : Migration d'urgence

```bash
# Migration rapide complète
./scripts/migrate-elasticsearch.sh elasticdump

# Validation immédiate
./scripts/validate-migration.sh
```

### Cas d'usage 3 : Migration avec snapshot

```bash
# Pour de gros volumes de données
./scripts/migrate-elasticsearch.sh snapshot

# Validation du snapshot
curl -s "http://192.168.1.44:9200/_snapshot/backup_repository/_all?pretty"
```
