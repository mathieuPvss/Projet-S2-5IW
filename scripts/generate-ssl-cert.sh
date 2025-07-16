#!/bin/bash

# Script pour générer un certificat SSL pour tous les domaines mapa-server.org
# Usage: ./generate-ssl-cert.sh

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Génération du certificat SSL pour mapa-server.org ===${NC}"

# Créer le dossier certs s'il n'existe pas
mkdir -p certs

# Vérifier si certbot est installé
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}Certbot n'est pas installé. Installation...${NC}"
    sudo apt update
    sudo apt install -y certbot
fi

# Domaines à inclure dans le certificat
DOMAINS=(
    "query-forge-dev.mapa-server.org"
    "api.mapa-server.org"
    "auth.mapa-server.org"
    "agent.mapa-server.org"
    "scraping.mapa-server.org"
    "adminer.mapa-server.org"
    "kibana.mapa-server.org"
    "prometheus.mapa-server.org"
    "grafana.mapa-server.org"
)

# Construire la commande certbot
CERTBOT_DOMAINS=""
for domain in "${DOMAINS[@]}"; do
    CERTBOT_DOMAINS="$CERTBOT_DOMAINS -d $domain"
done

echo -e "${YELLOW}Domaines à inclure dans le certificat:${NC}"
for domain in "${DOMAINS[@]}"; do
    echo "  - $domain"
done

echo -e "${YELLOW}Génération du certificat avec Let's Encrypt...${NC}"

# Arrêter temporairement les services qui utilisent les ports 80 et 443
echo -e "${YELLOW}Arrêt temporaire des services Docker...${NC}"
docker stack rm query-forge-dev 2>/dev/null || true
sleep 10

# Générer le certificat avec certbot
sudo certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email mathieupannetrat5@gmail.com \
    --agree-tos \
    --no-eff-email \
    $CERTBOT_DOMAINS

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Certificat généré avec succès!${NC}"
    
    # Copier les certificats dans le dossier certs
    echo -e "${YELLOW}Copie des certificats dans le dossier certs/...${NC}"
    
    # Le certificat principal (premier domaine de la liste)
    MAIN_DOMAIN="${DOMAINS[0]}"
    
    sudo cp "/etc/letsencrypt/live/$MAIN_DOMAIN/fullchain.pem" certs/cert.pem
    sudo cp "/etc/letsencrypt/live/$MAIN_DOMAIN/privkey.pem" certs/key.pem
    
    # Changer les permissions pour que Docker puisse lire
    sudo chmod 644 certs/cert.pem
    sudo chmod 644 certs/key.pem
    sudo chown $USER:$USER certs/cert.pem certs/key.pem
    
    echo -e "${GREEN}Certificats copiés dans ./certs/${NC}"
    echo -e "${GREEN}Vous pouvez maintenant relancer votre stack Docker Swarm${NC}"
    
else
    echo -e "${RED}Erreur lors de la génération du certificat${NC}"
    exit 1
fi

echo -e "${YELLOW}=== Informations importantes ===${NC}"
echo -e "• Les certificats sont valides 90 jours"
echo -e "• Configurez un cron job pour le renouvellement automatique:"
echo -e "  ${GREEN}sudo crontab -e${NC}"
echo -e "  ${GREEN}0 2 * * * certbot renew --quiet && systemctl reload nginx${NC}"
echo -e "• Pour renouveler manuellement:"
echo -e "  ${GREEN}sudo certbot renew${NC}"