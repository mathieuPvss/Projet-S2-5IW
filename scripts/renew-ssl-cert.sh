#!/bin/bash

# Script pour renouveler le certificat SSL automatiquement
# Usage: ./renew-ssl-cert.sh

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Renouvellement du certificat SSL ===${NC}"

# Renouveler le certificat
echo -e "${YELLOW}Tentative de renouvellement...${NC}"
sudo certbot renew --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Certificat renouvelé avec succès!${NC}"
    
    # Copier les nouveaux certificats
    MAIN_DOMAIN="query-forge-dev.mapa-server.org"
    
    sudo cp "/etc/letsencrypt/live/$MAIN_DOMAIN/fullchain.pem" ../certs/cert.pem
    sudo cp "/etc/letsencrypt/live/$MAIN_DOMAIN/privkey.pem" ../certs/key.pem
    
    # Changer les permissions
    sudo chmod 644 ../certs/cert.pem
    sudo chmod 644 ../certs/key.pem
    sudo chown $USER:$USER ../certs/cert.pem ../certs/key.pem
    
    # Redémarrer les services Docker
    echo -e "${YELLOW}Redémarrage des services Docker...${NC}"
    docker service update --force query-forge-dev_nginx
    
    echo -e "${GREEN}Certificat mis à jour et services redémarrés${NC}"
else
    echo -e "${YELLOW}Aucun renouvellement nécessaire ou erreur${NC}"
fi