#!/bin/bash

# 🔄 Script d'import des données Elasticsearch avec curl
# Utilisation: ./import-elasticsearch.sh [host] [contents_file]
# Exemple: ./import-elasticsearch.sh localhost:9200 contents.json

set -e

# Configuration
ELASTICSEARCH_HOST="${1:-localhost:9200}"
CONTENTS_FILE="${2:-contents.json}"
INDEX_NAME="contents"

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

# Vérifier que le fichier contents.json existe
check_contents_file() {
    if [ ! -f "$CONTENTS_FILE" ]; then
        error "Fichier contents.json non trouvé: $CONTENTS_FILE"
        exit 1
    fi
    
    log "Fichier contents.json trouvé: $CONTENTS_FILE"
    ls -la "$CONTENTS_FILE"
}

# Créer l'index avec les mappings appropriés
create_index() {
    log "Création de l'index ${INDEX_NAME}..."
    
    # Supprimer l'index s'il existe
    log "Suppression de l'index existant (si présent)..."
    curl -X DELETE "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" 2>/dev/null || true
    
    # Créer l'index avec les mappings appropriés pour le contenu
    curl -X PUT "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}" \
        -H "Content-Type: application/json" \
        -d '{
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
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
        }'
    
    success "Index ${INDEX_NAME} créé avec succès"
}

# Importer les données avec curl et l'API Bulk
import_with_curl() {
    log "🚀 Import des données avec curl..."
    
    # Vérifier que le fichier JSON est valide
    if ! head -n 1 "$CONTENTS_FILE" | jq empty 2>/dev/null; then
        error "Le fichier $CONTENTS_FILE n'est pas un JSON valide"
        exit 1
    fi
    
    # Créer un fichier temporaire pour le format bulk
    TEMP_FILE=$(mktemp)
    
    log "Préparation des données au format bulk..."
    
    # Convertir le fichier NDJSON au format bulk d'Elasticsearch
    # Chaque document doit être précédé d'une ligne d'action
    while IFS= read -r line; do
        # Ligne d'action pour l'index
        echo '{"index":{"_index":"'${INDEX_NAME}'"}}' >> "$TEMP_FILE"
        # Ligne de données
        echo "$line" >> "$TEMP_FILE"
    done < "$CONTENTS_FILE"
    
    # Compter le nombre de documents
    DOCS_COUNT=$(wc -l < "$CONTENTS_FILE")
    log "Nombre de documents à importer: $DOCS_COUNT"
    
    # Afficher un exemple des premières lignes du fichier bulk
    log "Exemple du format bulk (4 premières lignes):"
    head -n 4 "$TEMP_FILE"
    
    # Importer les données avec curl
    log "Import des données dans Elasticsearch..."
    RESPONSE=$(curl -s -X POST "http://${ELASTICSEARCH_HOST}/_bulk" \
        -H "Content-Type: application/x-ndjson" \
        --data-binary @"$TEMP_FILE")
    
    # Vérifier la réponse
    if echo "$RESPONSE" | jq -e '.errors == false' > /dev/null 2>&1; then
        success "Import réussi sans erreurs"
    else
        warning "Import terminé avec quelques erreurs"
        echo "$RESPONSE" | jq '.items[] | select(.index.error) | .index.error'
    fi
    
    # Nettoyer le fichier temporaire
    rm -f "$TEMP_FILE"
    
    success "Import terminé avec curl"
}

# Vérifier le statut après import
check_import_status() {
    log "Vérification du statut de l'import..."
    
    # Attendre que les documents soient indexés
    log "Attente de l'indexation (5 secondes)..."
    sleep 5
    
    # Forcer le refresh de l'index
    curl -X POST "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_refresh" 2>/dev/null
    
    # Vérifier la santé du cluster
    log "Santé du cluster:"
    curl -X GET "http://${ELASTICSEARCH_HOST}/_cluster/health?pretty"
    
    # Compter les documents
    DOCS_COUNT=$(curl -s "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_count" | jq '.count')
    success "Documents importés: $DOCS_COUNT"
    
    # Afficher un exemple de document
    log "Exemple de document importé:"
    curl -X GET "http://${ELASTICSEARCH_HOST}/${INDEX_NAME}/_search?size=1&pretty"
}

# Fonction d'aide
show_help() {
    echo "🔄 Script d'import des données Elasticsearch avec curl"
    echo ""
    echo "Usage: $0 [HOST] [CONTENTS_FILE]"
    echo ""
    echo "Paramètres:"
    echo "  HOST           Host Elasticsearch (défaut: localhost:9200)"
    echo "  CONTENTS_FILE  Fichier NDJSON contenant les données (défaut: contents.json)"
    echo ""
    echo "Format attendu:"
    echo "  Le fichier doit contenir des documents JSON, un par ligne (NDJSON)"
    echo "  Exemple:"
    echo "    {\"source\":\"youtube\",\"title\":\"Mon titre\"}"
    echo "    {\"source\":\"youtube\",\"title\":\"Mon autre titre\"}"
    echo ""
    echo "Exemples:"
    echo "  $0 localhost:9200 contents_cleaned.json"
    echo "  $0 192.168.1.44:9200"
    echo "  $0"
    echo ""
    echo "Le script va:"
    echo "  1. Vérifier la connectivité Elasticsearch"
    echo "  2. Créer l'index 'contents' avec les mappings appropriés"
    echo "  3. Convertir les données au format bulk d'Elasticsearch"
    echo "  4. Importer les données avec curl"
    echo "  5. Vérifier le statut de l'import"
}

# Fonction principale
main() {
    if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    log "🚀 Démarrage de l'import Elasticsearch..."
    log "Host cible: $ELASTICSEARCH_HOST"
    log "Fichier de données: $CONTENTS_FILE"
    log "Index: $INDEX_NAME"
    
    check_elasticsearch
    check_contents_file
    create_index
    import_with_curl
    check_import_status
    
    success "🎉 Import terminé avec succès!"
}

# Exécuter la fonction principale
main "$@"