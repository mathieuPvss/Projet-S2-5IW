#!/bin/bash

# Script de génération et configuration des certificats SSL
# Pour les domaines ualtarh.com

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Domaines à couvrir
DOMAINS=(
    "query-forge-dev.ualtarh.com"
    "api.ualtarh.com"
    "auth.ualtarh.com"
    "agent.ualtarh.com"
    "scraping.ualtarh.com"
    "adminer.ualtarh.com"
    "kibana.ualtarh.com"
)

# Créer le répertoire SSL
create_ssl_directory() {
    log "Création du répertoire SSL..."
    mkdir -p ./ssl
    chmod 755 ./ssl
}

# Générer un certificat auto-signé pour le développement
generate_self_signed() {
    log "Génération d'un certificat auto-signé pour le développement..."
    
    # Configuration OpenSSL
    cat > ./ssl/openssl.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = FR
ST = Paris
L = Paris
O = Query Forge Dev
OU = IT Department
CN = *.ualtarh.com

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.ualtarh.com
DNS.2 = ualtarh.com
DNS.3 = query-forge-dev.ualtarh.com
DNS.4 = api.ualtarh.com
DNS.5 = auth.ualtarh.com
DNS.6 = agent.ualtarh.com
DNS.7 = scraping.ualtarh.com
DNS.8 = adminer.ualtarh.com
DNS.9 = kibana.ualtarh.com
EOF

    # Générer la clé privée
    openssl genrsa -out ./ssl/key.pem 2048
    
    # Générer le certificat
    openssl req -new -x509 -key ./ssl/key.pem -out ./ssl/cert.pem -days 365 -config ./ssl/openssl.conf -extensions v3_req
    
    # Permissions
    chmod 600 ./ssl/key.pem
    chmod 644 ./ssl/cert.pem
    
    log "Certificat auto-signé généré avec succès"
    warn "Ce certificat est uniquement pour le développement"
}

# Générer une demande de certificat pour Let's Encrypt
generate_letsencrypt_request() {
    log "Génération d'une demande Let's Encrypt..."
    
    # Vérifier si certbot est installé
    if ! command -v certbot &> /dev/null; then
        error "Certbot n'est pas installé"
        echo "Installation: sudo apt-get install certbot python3-certbot-nginx"
        return 1
    fi
    
    # Préparer la commande certbot
    local certbot_cmd="certbot certonly --standalone --agree-tos --email admin@ualtarh.com"
    
    for domain in "${DOMAINS[@]}"; do
        certbot_cmd="$certbot_cmd -d $domain"
    done
    
    echo "Commande à exécuter sur votre serveur:"
    echo "$certbot_cmd"
    echo
    echo "Puis copiez les certificats:"
    echo "cp /etc/letsencrypt/live/${DOMAINS[0]}/fullchain.pem ./ssl/cert.pem"
    echo "cp /etc/letsencrypt/live/${DOMAINS[0]}/privkey.pem ./ssl/key.pem"
}

# Configurer le renouvellement automatique
setup_auto_renewal() {
    log "Configuration du renouvellement automatique..."
    
    cat > ./ssl/renew-certs.sh << 'EOF'
#!/bin/bash
# Script de renouvellement automatique des certificats

# Renouveler les certificats
certbot renew --quiet

# Copier les nouveaux certificats
cp /etc/letsencrypt/live/query-forge-dev.ualtarh.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/query-forge-dev.ualtarh.com/privkey.pem ./ssl/key.pem

# Redémarrer nginx dans le swarm
docker service update --force query-forge-dev_nginx
EOF

    chmod +x ./ssl/renew-certs.sh
    
    echo "Ajoutez cette ligne à votre crontab (crontab -e):"
    echo "0 3 * * * /path/to/ssl/renew-certs.sh"
}

# Fonction principale
main() {
    create_ssl_directory
    generate_letsencrypt_request
    setup_auto_renewal
}

# Exécution
main "$@"