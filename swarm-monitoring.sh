#!/bin/bash

# Script de monitoring pour Docker Swarm
# Surveillance et alertes du cluster

set -e

# Variables
STACK_NAME="query-forge"
ALERT_EMAIL="admin@example.com"
SLACK_WEBHOOK=""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Vérification de la santé des services
check_service_health() {
    local service=$1
    local replicas=$(docker service ls --format "{{.Replicas}}" --filter "name=${STACK_NAME}_${service}")
    
    if [[ -z "$replicas" ]]; then
        error "Service $service non trouvé"
        return 1
    fi
    
    local current=$(echo $replicas | cut -d'/' -f1)
    local desired=$(echo $replicas | cut -d'/' -f2)
    
    if [[ "$current" -ne "$desired" ]]; then
        error "Service $service: $current/$desired replicas"
        return 1
    fi
    
    return 0
}

# Vérification des resources
check_resources() {
    log "Vérification des ressources..."
    
    # Vérifier l'utilisation CPU et mémoire
    docker node ls --format "{{.ID}}" | while read NODE_ID; do
        local hostname=$(docker node inspect $NODE_ID --format "{{.Description.Hostname}}")
        local status=$(docker node inspect $NODE_ID --format "{{.Status.State}}")
        
        if [[ "$status" != "ready" ]]; then
            error "Node $hostname n'est pas prêt (status: $status)"
        fi
    done
}

# Vérification des volumes
check_volumes() {
    log "Vérification des volumes..."
    
    # Vérifier l'espace disque
    docker volume ls --format "{{.Name}}" | grep -E "(postgres|elasticsearch)" | while read volume; do
        local usage=$(docker system df --format "{{.Size}}" --verbose | grep "Local Volumes" -A 10 | grep "$volume" | awk '{print $2}')
        if [[ ! -z "$usage" ]]; then
            log "Volume $volume: $usage"
        fi
    done
}

# Vérification des networks
check_networks() {
    log "Vérification des réseaux..."
    
    docker network ls --format "{{.Name}}" | grep "${STACK_NAME}_" | while read network; do
        local driver=$(docker network inspect $network --format "{{.Driver}}")
        if [[ "$driver" != "overlay" ]]; then
            warn "Network $network n'utilise pas le driver overlay"
        fi
    done
}

# Test de connectivité
test_connectivity() {
    log "Test de connectivité..."
    
    # Tester les endpoints principaux
    local endpoints=(
        "https://query-forge-dev.ualtarh.com/health"
        "https://api.ualtarh.com/health"
        "https://auth.ualtarh.com/health"
        "https://agent.ualtarh.com/health"
        "https://scraping.ualtarh.com/health"
        "https://kibana.ualtarh.com/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$endpoint" > /dev/null; then
            log "✓ $endpoint accessible"
        else
            error "✗ $endpoint inaccessible"
        fi
    done
}

# Surveillance des logs
monitor_logs() {
    log "Surveillance des logs d'erreur..."
    
    # Rechercher les erreurs dans les logs
    local services=("nestjs" "auth-service" "agent-ia-service" "scraping-service" "sync-service" "frontend")
    
    for service in "${services[@]}"; do
        local errors=$(docker service logs --tail 100 "${STACK_NAME}_${service}" 2>/dev/null | grep -i "error\|exception\|failed" | wc -l)
        if [[ $errors -gt 0 ]]; then
            warn "Service $service: $errors erreurs détectées"
        fi
    done
}

# Sauvegarde des métriques
backup_metrics() {
    log "Sauvegarde des métriques..."
    
    local backup_dir="/tmp/swarm-metrics-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Sauvegarder les informations du cluster
    docker node ls > "$backup_dir/nodes.txt"
    docker service ls > "$backup_dir/services.txt"
    docker stack ps $STACK_NAME > "$backup_dir/stack.txt"
    
    # Sauvegarder les métriques système
    docker system df > "$backup_dir/system.txt"
    docker system events --since 1h --until now > "$backup_dir/events.txt"
    
    log "Métriques sauvegardées dans $backup_dir"
}

# Nettoyage automatique
auto_cleanup() {
    log "Nettoyage automatique..."
    
    # Nettoyer les images inutilisées
    docker image prune -f
    
    # Nettoyer les volumes inutilisés
    docker volume prune -f
    
    # Nettoyer les réseaux inutilisés
    docker network prune -f
    
    log "Nettoyage terminé"
}

# Surveillance continue
continuous_monitoring() {
    log "Démarrage de la surveillance continue..."
    
    while true; do
        echo -e "\n${BLUE}=== Surveillance $(date) ===${NC}"
        
        # Vérifier tous les services
        local services=("postgres" "elasticsearch" "nestjs" "auth-service" "agent-ia-service" "scraping-service" "sync-service" "frontend" "kibana" "nginx")
        local failed_services=()
        
        for service in "${services[@]}"; do
            if ! check_service_health "$service"; then
                failed_services+=("$service")
            fi
        done
        
        # Vérifier les ressources
        check_resources
        check_volumes
        check_networks
        
        # Tester la connectivité
        test_connectivity
        
        # Surveiller les logs
        monitor_logs
        
        # Alertes si nécessaire
        if [[ ${#failed_services[@]} -gt 0 ]]; then
            error "Services en échec: ${failed_services[*]}"
            # Ici vous pouvez ajouter des notifications (email, Slack, etc.)
        fi
        
        # Attendre avant la prochaine vérification
        sleep 60
    done
}

# Rapport de santé
health_report() {
    log "Génération du rapport de santé..."
    
    echo -e "\n${BLUE}=== RAPPORT DE SANTÉ DU CLUSTER ===${NC}"
    echo -e "Généré le: $(date)"
    echo
    
    # Statut des nodes
    echo -e "${YELLOW}Nodes:${NC}"
    docker node ls
    echo
    
    # Statut des services
    echo -e "${YELLOW}Services:${NC}"
    docker stack services $STACK_NAME
    echo
    
    # Utilisation des ressources
    echo -e "${YELLOW}Ressources:${NC}"
    docker system df
    echo
    
    # Événements récents
    echo -e "${YELLOW}Événements récents:${NC}"
    docker system events --since 1h --until now | tail -10
    echo
    
    # Volumes
    echo -e "${YELLOW}Volumes:${NC}"
    docker volume ls
    echo
    
    # Réseaux
    echo -e "${YELLOW}Réseaux:${NC}"
    docker network ls | grep "${STACK_NAME}_"
}

# Fonction principale
main() {
    case "${1:-monitor}" in
        "monitor")
            continuous_monitoring
            ;;
        "health")
            health_report
            ;;
        "backup")
            backup_metrics
            ;;
        "cleanup")
            auto_cleanup
            ;;
        "test")
            test_connectivity
            ;;
        *)
            echo "Usage: $0 {monitor|health|backup|cleanup|test}"
            echo "  monitor - Surveillance continue"
            echo "  health  - Rapport de santé"
            echo "  backup  - Sauvegarde des métriques"
            echo "  cleanup - Nettoyage automatique"
            echo "  test    - Test de connectivité"
            exit 1
            ;;
    esac
}

# Gestion des signaux
trap 'log "Arrêt de la surveillance"; exit 0' SIGINT SIGTERM

# Exécution
main "$@"