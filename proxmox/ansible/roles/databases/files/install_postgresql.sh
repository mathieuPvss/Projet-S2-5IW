#!/bin/bash
set -e

echo "🐘 Installation et configuration de PostgreSQL 16..."

# Mise à jour du système
apt update && apt upgrade -y

# Installation de PostgreSQL 16
apt install -y wget ca-certificates gnupg lsb-release
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16

# Configuration PostgreSQL - Création de l'utilisateur et de la base de données
echo "🔧 Configuration de l'utilisateur et de la base de données..."

# Créer l'utilisateur query_forge_dev_user
sudo -u postgres psql -c "CREATE USER query_forge_dev_user WITH PASSWORD 'bfqzefbdifnqdsjignpbqbfgg';"

# Créer la base de données db
sudo -u postgres psql -c "CREATE DATABASE db OWNER query_forge_dev_user;"

# Donner tous les privilèges à l'utilisateur sur sa base de données
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE db TO query_forge_dev_user;"

# Se connecter à la base de données db et donner les privilèges sur le schéma public
sudo -u postgres psql -d db -c "GRANT ALL ON SCHEMA public TO query_forge_dev_user;"
sudo -u postgres psql -d db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO query_forge_dev_user;"
sudo -u postgres psql -d db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO query_forge_dev_user;"
sudo -u postgres psql -d db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO query_forge_dev_user;"
sudo -u postgres psql -d db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO query_forge_dev_user;"

# Configuration des connexions réseau
cat >> /etc/postgresql/16/main/postgresql.conf << EOF
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
huge_pages = off
min_wal_size = 1GB
max_wal_size = 4GB
EOF

# Configuration des accès réseau
cat >> /etc/postgresql/16/main/pg_hba.conf << EOF
# Accès depuis le réseau K3s
host    all             all             192.168.1.0/24          md5
host    all             all             10.42.0.0/16            md5
EOF

# Démarrage et activation
systemctl restart postgresql
systemctl enable postgresql

# Vérification
echo "🔍 Vérification de la configuration..."
sudo -u postgres psql -c "SELECT version();"
sudo -u postgres psql -c "\du" | grep query_forge_dev_user
sudo -u postgres psql -c "\l" | grep db

echo "✅ PostgreSQL 16 installé et configuré"
echo "🔌 Accessible sur: $(hostname -I | awk '{print $1}'):5432"
echo "🗄️  Base de données: db"
echo "👤 Utilisateur: query_forge_dev_user"
echo "🔑 Mot de passe: bfqzefbdifnqdsjignpbqbfgg"
echo "🔗 URI de connexion: postgresql://query_forge_dev_user:bfqzefbdifnqdsjignpbqbfgg@$(hostname -I | awk '{print $1}'):5432/db?sslmode=disable"