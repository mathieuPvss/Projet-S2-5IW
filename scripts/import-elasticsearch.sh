#!/bin/bash

# 🔄 Script d'import des données Elasticsearch vers LXC
# Utilisation: ./import-elasticsearch.sh [method] [backup_dir]
# Méthodes disponibles: elasticdump, snapshot, curl

set -e

# Configuration
ELASTICSEARCH_HOST="${ELASTICSEARCH_HOST:-localhost:9200}"
BACKUP_DIR="${2:-./elasticsearch-backup}"
INDEX_NAME="contents"
SNAPSHOT_REPO="backup_repository"
LXC_IP="${LXC_IP:-192.168.1.44}"  # IP du LXC Elasticsearch

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

# Vérifier que les fichiers de backup existent
check_backup_files() {
    if [ ! -d "$BACKUP_DIR" ]; then
        error "Répertoire de sauvegarde non trouvé: $BACKUP_DIR"
        exit 1
    fi
    
    log "Fichiers de sauvegarde trouvés dans: $BACKUP_DIR"
    ls -la "$BACKUP_DIR"
}

# Méthode 1: Importer avec elasticdump (recommandé)
import_with_elasticdump() {
    log "🚀 Import avec elasticdump..."
    
    # Vérifier si elasticdump est installé
    if ! command -v elasticdump &> /dev/null; then
        warning "elasticdump n'est pas installé. Installation..."
        npm install -g elasticdump
    fi
    
    # Trouver les derniers fichiers de sauvegarde
    MAPPING_FILE=$(ls -t ${BACKUP_DIR}/${INDEX_NAME}_mappings_*.json | head -1)
    SETTINGS_FILE=$(ls -t ${BACKUP_DIR}/${INDEX_NAME}_settings_*.json | head -1)
    DATA_FILE=$(ls -t ${BACKUP_DIR}/${INDEX_NAME}_data_*.json | head -1)
    
    if [ -z "$MAPPING_FILE" ] || [ -z "$SETTINGS_FILE" ] || [ -z "$DATA_FILE" ]; then
        error "Fichiers de sauvegarde manquants dans $BACKUP_DIR"
        exit 1
    fi
    
    log "Fichiers à importer:"
    log "  - Mappings: $MAPPING_FILE"
    log "  - Settings: $SETTINGS_FILE"
    log "  - Data: $DATA_FILE"
    
    # Supprimer l'index s'il existe
    log "Suppression de l'index existant (si présent)..."
    curl -X DELETE "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" 2>/dev/null || true
    
    # Import des settings
    log "Import des settings..."
    elasticdump \
        --input="$SETTINGS_FILE" \
        --output="http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" \
        --type=settings
    
    # Import des mappings
    log "Import des mappings..."
    elasticdump \
        --input="$MAPPING_FILE" \
        --output="http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" \
        --type=mapping
    
    # Import des données
    log "Import des données..."
    elasticdump \
        --input="$DATA_FILE" \
        --output="http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" \
        --type=data \
        --limit=1000
    
    success "Import terminé avec elasticdump"
}

# Méthode 2: Importer avec snapshot
import_with_snapshot() {
    log "📸 Import avec snapshot Elasticsearch..."
    
    warning "⚠️  Cette méthode nécessite que les fichiers de snapshot soient"
    warning "   copiés dans le répertoire /usr/share/elasticsearch/snapshots du LXC"
    
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
    
    # Lister les snapshots disponibles
    log "Snapshots disponibles:"
    curl -X GET "http://${ELASTICSEARCH_HOST}/_snapshot/${SNAPSHOT_REPO}/_all?pretty"
    
    # Demander le nom du snapshot à restaurer
    read -p "Entrez le nom du snapshot à restaurer: " SNAPSHOT_NAME
    
    # Fermer l'index s'il existe
    log "Fermeture de l'index existant..."
    curl -X POST "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_close" 2>/dev/null || true
    
    # Restaurer le snapshot
    log "Restauration du snapshot: $SNAPSHOT_NAME..."
    curl -X POST "http://${ELASTICSEARCH_HOST}/_snapshot/${SNAPSHOT_REPO}/${SNAPSHOT_NAME}/_restore?wait_for_completion=true" \
        -H "Content-Type: application/json" \
        -d "{
            \"indices\": \"${INDEX_NAME}\",
            \"ignore_unavailable\": true,
            \"include_global_state\": false,
            \"rename_pattern\": \"${INDEX_NAME}\",
            \"rename_replacement\": \"${INDEX_NAME}\"
        }"
    
    success "Snapshot restauré: $SNAPSHOT_NAME"
}

# Méthode 3: Import simple avec curl
import_with_curl() {
    log "🔄 Import avec curl..."
    
    # Trouver les fichiers de sauvegarde
    MAPPING_FILE=$(ls -t ${BACKUP_DIR}/${INDEX_NAME}_mappings_*.json | head -1)
    SETTINGS_FILE=$(ls -t ${BACKUP_DIR}/${INDEX_NAME}_settings_*.json | head -1)
    DATA_FILE=$(ls -t ${BACKUP_DIR}/${INDEX_NAME}_data_*.json | head -1)
    
    if [ -z "$MAPPING_FILE" ] || [ -z "$SETTINGS_FILE" ] || [ -z "$DATA_FILE" ]; then
        error "Fichiers de sauvegarde manquants dans $BACKUP_DIR"
        exit 1
    fi
    
    # Supprimer l'index s'il existe
    log "Suppression de l'index existant (si présent)..."
    curl -X DELETE "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" 2>/dev/null || true
    
    # Créer l'index avec les mappings et settings
    log "Création de l'index avec mappings et settings..."
    
    # Extraire les mappings et settings des fichiers JSON
    MAPPINGS=$(cat "$MAPPING_FILE" | jq '.'"$INDEX_NAME"'.mappings')
    SETTINGS=$(cat "$SETTINGS_FILE" | jq '.'"$INDEX_NAME"'.settings')
    
    curl -X PUT "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" \
        -H "Content-Type: application/json" \
        -d "{
            \"settings\": $SETTINGS,
            \"mappings\": $MAPPINGS
        }"
    
    # Importer les données (nécessite un traitement spécial pour le format de recherche)
    log "Import des données..."
    warning "⚠️  L'import avec curl nécessite un traitement manuel des données"
    warning "   Pour une grande quantité de données, utilisez elasticdump"
    
    success "Structure de l'index créée. Données à importer manuellement."
}

# Vérifier le statut après import
check_import_status() {
    log "Vérification du statut de l'import..."
    
    # Vérifier la santé du cluster
    curl -X GET "http://${ELASTICSEARCH_HOST}/_cluster/health?pretty"
    
    # Vérifier les statistiques de l'index
    curl -X GET "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_stats?pretty"
    
    # Compter les documents
    DOCS_COUNT=$(curl -s "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_count" | jq '.count')
    success "Documents importés: $DOCS_COUNT"
}

# Configuration du LXC Elasticsearch
setup_lxc_elasticsearch() {
    log "🔧 Configuration du LXC Elasticsearch..."
    
    # Vérifier si le LXC est accessible
    if ping -c 1 "$LXC_IP" &> /dev/null; then
        success "LXC Elasticsearch accessible sur $LXC_IP"
        
        # Mettre à jour la configuration pour pointer vers le LXC
        export ELASTICSEARCH_HOST="$LXC_IP:9200"
        log "Configuration mise à jour: ELASTICSEARCH_HOST=$ELASTICSEARCH_HOST"
    else
        warning "LXC Elasticsearch non accessible sur $LXC_IP"
        warning "Vérifiez que le LXC est démarré et configuré"
    fi
}

# Fonction d'aide
show_help() {
    echo "🔄 Script d'import des données Elasticsearch vers LXC"
    echo ""
    echo "Usage: $0 [METHOD] [BACKUP_DIR]"
    echo ""
    echo "Méthodes disponibles:"
    echo "  elasticdump    Import avec elasticdump (recommandé)"
    echo "  snapshot       Import avec snapshot Elasticsearch"
    echo "  curl           Import simple avec curl"
    echo ""
    echo "Variables d'environnement:"
    echo "  ELASTICSEARCH_HOST    Host Elasticsearch cible (défaut: localhost:9200)"
    echo "  LXC_IP               IP du LXC Elasticsearch (défaut: 192.168.1.44)"
    echo ""
    echo "Exemples:"
    echo "  $0 elasticdump ./elasticsearch-backup"
    echo "  LXC_IP=192.168.1.44 $0 elasticdump"
    echo "  ELASTICSEARCH_HOST=192.168.1.44:9200 $0 snapshot"
}

# Fonction principale
main() {
    local method="${1:-elasticdump}"
    
    if [ "$method" = "help" ] || [ "$method" = "-h" ] || [ "$method" = "--help" ]; then
        show_help
        exit 0
    fi
    
    log "🚀 Démarrage de l'import Elasticsearch..."
    log "Méthode: $method"
    log "Host cible: $ELASTICSEARCH_HOST"
    log "Répertoire de sauvegarde: $BACKUP_DIR"
    log "Index: $INDEX_NAME"
    
    # Configuration du LXC si nécessaire
    if [ -n "$LXC_IP" ]; then
        setup_lxc_elasticsearch
    fi
    
    check_elasticsearch
    check_backup_files
    
    case $method in
        "elasticdump")
            import_with_elasticdump
            ;;
        "snapshot")
            import_with_snapshot
            ;;
        "curl")
            import_with_curl
            ;;
        *)
            error "Méthode inconnue: $method"
            show_help
            exit 1
            ;;
    esac
    
    check_import_status
    success "🎉 Import terminé avec succès!"
}

# Exécuter la fonction principale
main "$@" 