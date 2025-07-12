#!/bin/bash

# 🔄 Script de migration complète Elasticsearch vers LXC
# Utilisation: ./migrate-elasticsearch.sh [method]

set -e

# Configuration
DOCKER_CONTAINER="elasticsearch"
DOCKER_COMPOSE_FILE="compose.yaml"
LXC_IP="${LXC_IP:-192.168.1.44}"
BACKUP_DIR="./elasticsearch-backup"
METHOD="${1:-elasticdump}"

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

# Vérifier les prérequis
check_prerequisites() {
    log "🔍 Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérifier que les scripts existent
    if [ ! -f "./scripts/export-elasticsearch.sh" ] || [ ! -f "./scripts/import-elasticsearch.sh" ]; then
        error "Scripts d'export/import manquants"
        exit 1
    fi
    
    # Rendre les scripts exécutables
    chmod +x ./scripts/export-elasticsearch.sh
    chmod +x ./scripts/import-elasticsearch.sh
    
    success "Prérequis OK"
}

# Vérifier le statut du container Docker
check_docker_container() {
    log "🐳 Vérification du container Elasticsearch..."
    
    if docker ps | grep -q "$DOCKER_CONTAINER"; then
        success "Container Elasticsearch en cours d'exécution"
        
        # Obtenir l'IP du container
        CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$DOCKER_CONTAINER")
        if [ -n "$CONTAINER_IP" ]; then
            log "IP du container: $CONTAINER_IP"
            export ELASTICSEARCH_HOST="$CONTAINER_IP:9200"
        else
            export ELASTICSEARCH_HOST="localhost:9200"
        fi
    else
        error "Container Elasticsearch non trouvé ou arrêté"
        log "Démarrage du container..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d elasticsearch
        
        # Attendre que le container soit prêt
        log "Attente du démarrage..."
        sleep 30
        
        # Vérifier à nouveau
        if docker ps | grep -q "$DOCKER_CONTAINER"; then
            success "Container Elasticsearch démarré"
        else
            error "Impossible de démarrer le container Elasticsearch"
            exit 1
        fi
    fi
}

# Vérifier le statut du LXC
check_lxc_status() {
    log "🔧 Vérification du LXC Elasticsearch..."
    
    if ping -c 1 "$LXC_IP" &> /dev/null; then
        success "LXC Elasticsearch accessible sur $LXC_IP"
        
        # Vérifier si Elasticsearch est en cours d'exécution
        if curl -s "http://${LXC_IP}:9200/_cluster/health" &> /dev/null; then
            success "Elasticsearch en cours d'exécution sur le LXC"
        else
            warning "Elasticsearch non accessible sur le LXC"
            warning "Vérifiez que le service est démarré"
        fi
    else
        error "LXC Elasticsearch non accessible sur $LXC_IP"
        error "Vérifiez que le LXC est démarré"
        exit 1
    fi
}

# Exporter les données depuis Docker
export_from_docker() {
    log "📤 Export des données depuis Docker..."
    
    # Exporter les données
    ELASTICSEARCH_HOST="$ELASTICSEARCH_HOST" ./scripts/export-elasticsearch.sh "$METHOD"
    
    success "Export terminé depuis Docker"
}

# Importer les données vers le LXC
import_to_lxc() {
    log "📥 Import des données vers le LXC..."
    
    # Importer les données
    ELASTICSEARCH_HOST="$LXC_IP:9200" ./scripts/import-elasticsearch.sh "$METHOD" "$BACKUP_DIR"
    
    success "Import terminé vers le LXC"
}

# Comparer les données
compare_data() {
    log "🔍 Comparaison des données..."
    
    # Compter les documents dans Docker
    DOCKER_COUNT=$(curl -s "http://${ELASTICSEARCH_HOST}/_count" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    
    # Compter les documents dans le LXC
    LXC_COUNT=$(curl -s "http://${LXC_IP}:9200/_count" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    
    log "Documents dans Docker: $DOCKER_COUNT"
    log "Documents dans LXC: $LXC_COUNT"
    
    if [ "$DOCKER_COUNT" = "$LXC_COUNT" ]; then
        success "✅ Migration réussie ! Nombre de documents identique"
    else
        warning "⚠️  Nombre de documents différent. Vérifiez la migration"
    fi
}

# Nettoyer les fichiers temporaires
cleanup() {
    log "🧹 Nettoyage des fichiers temporaires..."
    
    if [ -d "$BACKUP_DIR" ]; then
        read -p "Supprimer le répertoire de sauvegarde $BACKUP_DIR ? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$BACKUP_DIR"
            success "Répertoire de sauvegarde supprimé"
        fi
    fi
}

# Créer un script de validation
create_validation_script() {
    log "📋 Création du script de validation..."
    
    cat > ./scripts/validate-migration.sh << 'EOF'
#!/bin/bash

# Script de validation de la migration
DOCKER_HOST="${ELASTICSEARCH_HOST:-localhost:9200}"
LXC_HOST="${LXC_IP:-192.168.1.44}:9200"

echo "🔍 Validation de la migration Elasticsearch"
echo "================================="

# Vérifier la connectivité
echo "📡 Test de connectivité:"
echo -n "  Docker: "
if curl -s "http://${DOCKER_HOST}/_cluster/health" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ KO"
fi

echo -n "  LXC: "
if curl -s "http://${LXC_HOST}/_cluster/health" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ KO"
fi

# Comparer les index
echo ""
echo "📊 Comparaison des index:"
echo "  Docker:"
curl -s "http://${DOCKER_HOST}/_cat/indices?v"
echo ""
echo "  LXC:"
curl -s "http://${LXC_HOST}/_cat/indices?v"

# Comparer les mappings
echo ""
echo "🗂️  Comparaison des mappings:"
echo "  Docker:"
curl -s "http://${DOCKER_HOST}/contents/_mapping" | jq '.contents.mappings.properties | keys'
echo "  LXC:"
curl -s "http://${LXC_HOST}/contents/_mapping" | jq '.contents.mappings.properties | keys'

# Test de recherche
echo ""
echo "🔍 Test de recherche:"
SEARCH_QUERY="javascript"
echo "  Recherche: $SEARCH_QUERY"
echo "  Docker résultats:"
curl -s "http://${DOCKER_HOST}/contents/_search?q=$SEARCH_QUERY&size=1" | jq '.hits.total'
echo "  LXC résultats:"
curl -s "http://${LXC_HOST}/contents/_search?q=$SEARCH_QUERY&size=1" | jq '.hits.total'

echo ""
echo "✅ Validation terminée"
EOF

    chmod +x ./scripts/validate-migration.sh
    success "Script de validation créé: ./scripts/validate-migration.sh"
}

# Fonction d'aide
show_help() {
    echo "🔄 Script de migration complète Elasticsearch vers LXC"
    echo ""
    echo "Usage: $0 [METHOD]"
    echo ""
    echo "Méthodes disponibles:"
    echo "  elasticdump    Migration avec elasticdump (recommandé)"
    echo "  snapshot       Migration avec snapshot Elasticsearch"
    echo "  curl           Migration simple avec curl"
    echo ""
    echo "Variables d'environnement:"
    echo "  LXC_IP                IP du LXC Elasticsearch (défaut: 192.168.1.44)"
    echo ""
    echo "Exemples:"
    echo "  $0 elasticdump"
    echo "  LXC_IP=192.168.1.50 $0 elasticdump"
    echo ""
    echo "Étapes de la migration:"
    echo "  1. Vérification des prérequis"
    echo "  2. Vérification du container Docker"
    echo "  3. Vérification du LXC"
    echo "  4. Export depuis Docker"
    echo "  5. Import vers LXC"
    echo "  6. Validation"
    echo "  7. Nettoyage (optionnel)"
}

# Fonction principale
main() {
    if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    log "🚀 Démarrage de la migration Elasticsearch"
    log "Méthode: $METHOD"
    log "LXC IP: $LXC_IP"
    log "Répertoire de sauvegarde: $BACKUP_DIR"
    
    # Étapes de la migration
    check_prerequisites
    check_docker_container
    check_lxc_status
    export_from_docker
    import_to_lxc
    compare_data
    create_validation_script
    
    success "🎉 Migration terminée avec succès!"
    log "📋 Exécutez ./scripts/validate-migration.sh pour valider la migration"
    
    # Proposer le nettoyage
    cleanup
}

# Exécuter la fonction principale
main "$@" 