#!/bin/bash

# Script de déploiement pour Docker Swarm
# Gestion complète du cluster de production

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuration
STACK_NAME="query-forge"
COMPOSE_FILE="docker-compose.swarm.yml"
REGISTRY="localhost"
VERSION="latest"

# Fonctions utilitaires
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier si Docker Swarm est initialisé
    if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
        error "Docker Swarm n'est pas initialisé"
        echo "Exécutez: docker swarm init"
        exit 1
    fi
    
    # Vérifier les fichiers nécessaires
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Fichier $COMPOSE_FILE introuvable"
        exit 1
    fi
    
    if [[ ! -f ".env" ]]; then
        warn "Fichier .env introuvable, utilisation des variables d'environnement"
    fi
    
    log "Prérequis vérifiés avec succès"
}

# Configuration des labels sur les nodes
setup_node_labels() {
    log "Configuration des labels sur les nodes..."
    
    # Obtenir la liste des nodes
    NODES=$(docker node ls --format "{{.ID}}" --filter "role=worker")
    MANAGER_NODE=$(docker node ls --format "{{.ID}}" --filter "role=manager" | head -1)
    
    # Labelliser le manager pour les bases de données
    docker node update --label-add database=true $MANAGER_NODE
    docker node update --label-add monitoring=true $MANAGER_NODE
    
    # Labelliser les workers
    for NODE in $NODES; do
        docker node update --label-add app=true $NODE
        docker node update --label-add frontend=true $NODE
    done
    
    log "Labels configurés"
}

# Création des volumes persistants
create_volumes() {
    log "Création des volumes persistants..."
    
    # Créer les répertoires sur les nodes
    docker node ls --format "{{.Hostname}}" | while read NODE; do
        ssh root@$NODE "mkdir -p /data/postgres /data/elasticsearch"
    done
    
    log "Volumes créés"
}

# Création des secrets
create_secrets() {
    log "Création des secrets..."
    
    # Créer le secret pour PostgreSQL
    if [[ ! -z "$POSTGRES_PASSWORD" ]]; then
        echo "$POSTGRES_PASSWORD" | docker secret create postgres_password - 2>/dev/null || true
    fi
    
    log "Secrets créés"
}

# Déploiement du stack
deploy_stack() {
    log "Déploiement du stack $STACK_NAME..."
    
    # Charger les variables d'environnement
    if [[ -f ".env" ]]; then
        export $(cat .env | xargs)
    fi
    
    # Déployer le stack
    docker stack deploy -c $COMPOSE_FILE $STACK_NAME
    
    log "Stack déployé avec succès"
}

# Vérification du déploiement
check_deployment() {
    log "Vérification du déploiement..."
    
    # Attendre que les services soient prêts
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        local running_services=$(docker stack services $STACK_NAME --format "{{.Name}}: {{.Replicas}}" | grep -c "1/1\|2/2\|3/3" || true)
        local total_services=$(docker stack services $STACK_NAME --format "{{.Name}}" | wc -l)
        
        if [[ $running_services -eq $total_services ]]; then
            log "Tous les services sont déployés et fonctionnels"
            return 0
        fi
        
        log "Attente du déploiement... ($running_services/$total_services services prêts)"
        sleep 10
        ((attempt++))
    done
    
    error "Timeout: le déploiement n'a pas terminé dans les temps"
    return 1
}

# Affichage du statut
show_status() {
    log "Statut du cluster:"
    echo -e "${BLUE}Nodes:${NC}"
    docker node ls
    echo
    
    echo -e "${BLUE}Services:${NC}"
    docker stack services $STACK_NAME
    echo
    
    echo -e "${BLUE}Containers:${NC}"
    docker stack ps $STACK_NAME
}

# Nettoyage
cleanup() {
    log "Nettoyage du stack $STACK_NAME..."
    docker stack rm $STACK_NAME
    
    # Attendre que le stack soit complètement supprimé
    while docker stack ls --format "{{.Name}}" | grep -q "$STACK_NAME"; do
        log "Attente de la suppression du stack..."
        sleep 5
    done
    
    log "Stack supprimé"
}

# Mise à jour
update_stack() {
    log "Mise à jour du stack $STACK_NAME..."
    
    # Reconstruire les images
    build_images
    
    # Redéployer le stack
    deploy_stack
    
    log "Stack mis à jour"
}

# Fonction principale
main() {
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            setup_node_labels
            create_volumes
            create_secrets
            build_images
            deploy_stack
            check_deployment
            show_status
            ;;
        "update")
            update_stack
            check_deployment
            show_status
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "logs")
            docker service logs -f ${STACK_NAME}_${2:-frontend}
            ;;
        *)
            echo "Usage: $0 {deploy|update|status|cleanup|logs <service>}"
            echo "  deploy  - Déploie le stack complet"
            echo "  update  - Met à jour le stack"
            echo "  status  - Affiche le statut du cluster"
            echo "  cleanup - Supprime le stack"
            echo "  logs    - Affiche les logs d'un service"
            exit 1
            ;;
    esac
}

# Gestion des signaux
trap cleanup SIGINT SIGTERM

# Exécution du script
main "$@"