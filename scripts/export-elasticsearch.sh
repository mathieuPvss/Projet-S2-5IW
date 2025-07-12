#!/bin/bash

# 🔄 Script d'export des données Elasticsearch
# Utilisation: ./export-elasticsearch.sh [method]
# Méthodes disponibles: elasticdump, snapshot, curl

set -e

# Configuration
ELASTICSEARCH_HOST="${ELASTICSEARCH_HOST:-localhost:9200}"
BACKUP_DIR="./elasticsearch-backup"
INDEX_NAME="contents"
SNAPSHOT_REPO="backup_repository"
DATE=$(date +%Y%m%d_%H%M%S)

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier la connectivité Elasticsearch
check_elasticsearch() {
    log "Vérification de la connectivité Elasticsearch..."
    if curl -s "http://${ELASTICSEARCH_HOST}/_cluster/health" > /dev/null; then
        success "Elasticsearch accessible sur http://${ELASTICSEARCH_HOST}"
    else
        error "Impossible de se connecter à Elasticsearch sur http://${ELASTICSEARCH_HOST}"
        exit 1
    fi
}

# Créer le répertoire de sauvegarde
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        success "Répertoire de sauvegarde créé: $BACKUP_DIR"
    fi
}

# Méthode 1: Utiliser elasticdump (recommandé)
export_with_elasticdump() {
    log "🚀 Export avec elasticdump..."
    
    # Vérifier si elasticdump est installé
    if ! command -v elasticdump &> /dev/null; then
        warning "elasticdump n'est pas installé. Installation..."
        npm install -g elasticdump
    fi
    
    # Export des mappings
    log "Export des mappings de l'index $INDEX_NAME..."
    elasticdump \
        --input=http://${ELASTICSEARCH_HOST}/${INDEX_NAME} \
        --output=${BACKUP_DIR}/${INDEX_NAME}_mappings_${DATE}.json \
        --type=mapping
    
    # Export des settings
    log "Export des settings de l'index $INDEX_NAME..."
    elasticdump \
        --input=http://${ELASTICSEARCH_HOST}/${INDEX_NAME} \
        --output=${BACKUP_DIR}/${INDEX_NAME}_settings_${DATE}.json \
        --type=settings
    
    # Export des données
    log "Export des données de l'index $INDEX_NAME..."
    elasticdump \
        --input=http://${ELASTICSEARCH_HOST}/${INDEX_NAME} \
        --output=${BACKUP_DIR}/${INDEX_NAME}_data_${DATE}.json \
        --type=data \
        --limit=1000
    
    success "Export terminé avec elasticdump"
    success "Fichiers sauvegardés dans: $BACKUP_DIR"
}

# Méthode 2: Utiliser les snapshots Elasticsearch
export_with_snapshot() {
    log "📸 Export avec snapshot Elasticsearch..."
    
    # Créer le repository de snapshot
    log "Création du repository de snapshot..."
    curl -X PUT "http://${ELASTICSEARCH_HOST}/_snapshot/${SNAPSHOT_REPO}" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"fs\",
            \"settings\": {
                \"location\": \"/usr/share/elasticsearch/snapshots\"
            }
        }"
    
    # Créer le snapshot
    SNAPSHOT_NAME="snapshot_${DATE}"
    log "Création du snapshot: $SNAPSHOT_NAME..."
    curl -X PUT "http://${ELASTICSEARCH_HOST}/_snapshot/${SNAPSHOT_REPO}/${SNAPSHOT_NAME}?wait_for_completion=true" \
        -H "Content-Type: application/json" \
        -d "{
            \"indices\": \"${INDEX_NAME}\",
            \"ignore_unavailable\": true,
            \"include_global_state\": false
        }"
    
    success "Snapshot créé: $SNAPSHOT_NAME"
    warning "Note: Le snapshot est stocké dans le volume Elasticsearch"
    warning "Vous devrez copier le contenu du répertoire /usr/share/elasticsearch/snapshots"
}

# Méthode 3: Export simple avec curl (pour petites quantités)
export_with_curl() {
    log "🔄 Export avec curl..."
    
    # Export des mappings
    log "Export des mappings..."
    curl -X GET "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_mapping" \
        > ${BACKUP_DIR}/${INDEX_NAME}_mappings_${DATE}.json
    
    # Export des settings
    log "Export des settings..."
    curl -X GET "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_settings" \
        > ${BACKUP_DIR}/${INDEX_NAME}_settings_${DATE}.json
    
    # Export des données (avec scroll pour toutes les données)
    log "Export des données..."
    curl -X GET "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_search?scroll=1m&size=1000" \
        > ${BACKUP_DIR}/${INDEX_NAME}_data_${DATE}.json
    
    success "Export terminé avec curl"
}

# Fonction d'aide
show_help() {
    echo "🔄 Script d'export des données Elasticsearch"
    echo ""
    echo "Usage: $0 [METHOD]"
    echo ""
    echo "Méthodes disponibles:"
    echo "  elasticdump    Export avec elasticdump (recommandé)"
    echo "  snapshot       Export avec snapshot Elasticsearch"
    echo "  curl           Export simple avec curl"
    echo "  all            Toutes les méthodes"
    echo ""
    echo "Variables d'environnement:"
    echo "  ELASTICSEARCH_HOST    Host Elasticsearch (défaut: localhost:9200)"
    echo ""
    echo "Exemples:"
    echo "  $0 elasticdump"
    echo "  ELASTICSEARCH_HOST=192.168.1.100:9200 $0 snapshot"
}

# Fonction principale
main() {
    local method="${1:-elasticdump}"
    
    if [ "$method" = "help" ] || [ "$method" = "-h" ] || [ "$method" = "--help" ]; then
        show_help
        exit 0
    fi
    
    log "🚀 Démarrage de l'export Elasticsearch..."
    log "Méthode: $method"
    log "Host: $ELASTICSEARCH_HOST"
    log "Index: $INDEX_NAME"
    
    check_elasticsearch
    create_backup_dir
    
    case $method in
        "elasticdump")
            export_with_elasticdump
            ;;
        "snapshot")
            export_with_snapshot
            ;;
        "curl")
            export_with_curl
            ;;
        "all")
            export_with_elasticdump
            export_with_snapshot
            export_with_curl
            ;;
        *)
            error "Méthode inconnue: $method"
            show_help
            exit 1
            ;;
    esac
    
    success "🎉 Export terminé avec succès!"
    log "Fichiers disponibles dans: $BACKUP_DIR"
    ls -la "$BACKUP_DIR"
}

# Exécuter la fonction principale
main "$@" 