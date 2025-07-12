#!/bin/bash
set -e

echo "🔍 Installation et configuration d'Elasticsearch 9..."

# Mise à jour du système
apt update && apt upgrade -y

# Installation de Java 17 (requis pour Elasticsearch 9)
apt install -y openjdk-17-jdk curl gpg

# Ajout du repository Elasticsearch
curl -fsSL https://artifacts.elastic.co/GPG-KEY-elasticsearch | gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/9.x/apt stable main" > /etc/apt/sources.list.d/elastic-9.x.list

# Installation d'Elasticsearch
apt update
apt install -y elasticsearch

# Configuration Elasticsearch
cat > /etc/elasticsearch/elasticsearch.yml << EOF
cluster.name: queryforge-cluster
node.name: elasticsearch-node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
discovery.type: single-node

# Sécurité désactivée pour simplifier (à adapter selon vos besoins)
xpack.security.enabled: false
xpack.security.enrollment.enabled: false
xpack.security.http.ssl:
  enabled: false
xpack.security.transport.ssl:
  enabled: false

# Performance
indices.memory.index_buffer_size: 10%
indices.queries.cache.size: 10%
indices.requests.cache.size: 2%
EOF

# Configuration JVM (adapter selon la RAM disponible)
cat > /etc/elasticsearch/jvm.options.d/heap.options << EOF
-Xms1g
-Xmx1g
EOF

# Permissions
chown -R elasticsearch:elasticsearch /etc/elasticsearch
chown -R elasticsearch:elasticsearch /var/lib/elasticsearch
chown -R elasticsearch:elasticsearch /var/log/elasticsearch

# Démarrage et activation
systemctl daemon-reload
systemctl enable elasticsearch
systemctl start elasticsearch

# Attendre le démarrage
echo "⏳ Attente du démarrage d'Elasticsearch..."
sleep 30

# Vérification
curl -X GET "localhost:9200/_cluster/health?pretty"

echo "✅ Elasticsearch 9 installé et configuré"
echo "🔌 Accessible sur: $(hostname -I | awk '{print $1}'):9200"
echo "📊 Cluster: queryforge-cluster"