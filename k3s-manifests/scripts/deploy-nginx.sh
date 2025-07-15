#!/bin/bash

echo "🚀 Déploiement complet sur K3s avec nginx-ingress..."

# Créer les répertoires de données sur les nœuds
echo "📁 Création des répertoires de données (prometheus, grafana, bases de données)"
sudo mkdir -p /var/lib/k3s/storage/{postgres,elasticsearch}
sudo mkdir -p /data/{prometheus,grafana}
sudo chmod 777 /var/lib/k3s/storage/{postgres,elasticsearch}
sudo chmod 777 /data/{prometheus,grafana}

# Déploiement par étapes
echo "🏗️ Phase 1: Namespaces et configuration de base..."
kubectl apply -f ../namespace/
kubectl apply -f ../secrets/
kubectl apply -f ../configmaps/

echo "🔐 Phase 1.1: Cert-manager et secrets SSL..."
kubectl apply -f ../cert-manager/cert-manager.yaml
kubectl apply -f ../secrets/cloudflare-secret-nginx.yaml

echo "⏳ Attente du démarrage de cert-manager... (30s)"
sleep 30

echo "🌐 Phase 1.2: nginx-ingress-controller..."
kubectl apply -f ../nginx/nginx-ingress-controller.yaml

echo "⏳ Attente du démarrage de nginx-ingress... (30s)"
sleep 30

echo "🔐 Phase 1.3: Cloudflare issuer et certificats..."
kubectl apply -f ../cert-manager/cloudflare-issuer.yaml

echo "💾 Phase 2: Volumes persistants..."
kubectl apply -f ../persistent-volumes/

echo "⏳ Attente de la création des volumes... (10s)"
sleep 10

echo "🗄️ Phase 3: Bases de données postgres et elasticsearch (internes)"
kubectl apply -f ../databases/postgres-internal.yaml
kubectl apply -f ../databases/elasticsearch-internal.yaml

echo "🗄️ Phase 3.1: Set up metrics for postgres and elasticsearch"
kubectl apply -f ../databases/postgres-metrics.yaml
kubectl apply -f ../databases/elasticsearch-metrics.yaml

echo "⏳ Attente du démarrage des bases de données... (60s)"
sleep 60

# Vérifier que les bases de données sont prêtes
echo "🔍 Vérification du statut des bases de données..."
kubectl wait --for=condition=ready pod -l app=postgres -n query-forge-dev --timeout=300s
kubectl wait --for=condition=ready pod -l app=elasticsearch -n query-forge-dev --timeout=300s

echo "⚙️ Phase 4: Services backend..."
echo "⚙️ Phase 4.1: Auth"
kubectl apply -f ../backend/auth.yaml
echo "⚙️ Phase 4.2: Nestjs"
kubectl apply -f ../backend/nestjs.yaml
echo "⚙️ Phase 4.3: Agent IA"
kubectl apply -f ../backend/agent-ai.yaml
echo "⚙️ Phase 4.4: Scraping"
kubectl apply -f ../backend/scraping.yaml

echo "⏳ Attente avant de démarrer le sync car le nest doit faire ses migrations + seed "
sleep 60

echo "⚙️ Phase 4.5: Sync"
kubectl apply -f ../backend/sync.yaml

echo "🌐 Phase 5: Frontend..."
kubectl apply -f ../frontend/frontend.yaml

echo "📊 Phase 6: Monitoring..."
echo "⚙️ Phase 6.1: Prometheus"
kubectl apply -f ../monitoring/prometheus/prometheus-configmap.yaml
kubectl apply -f ../monitoring/prometheus/prometheus-deployment.yaml
echo "⚙️ Phase 6.2: Grafana"
kubectl apply -f ../monitoring/grafana/grafana-configmap.yaml
kubectl apply -f ../monitoring/grafana/grafana.yaml
echo "⚙️ Phase 6.3: Kibana"
kubectl apply -f ../monitoring/kibana/kibana.yaml

echo "🛠️ Phase 7: Outils (adminer)"
kubectl apply -f ../tools/adminer.yaml

echo "⏳ Attente du démarrage des services... (60s)"
sleep 60

echo "⏳ Attente de la génération des certificats SSL... (30s)"
sleep 30

echo "🌍 Phase 8: nginx Ingress"
kubectl apply -f ../ingress/nginx-app-ingress.yaml
echo "🌍 Phase 8.1: nginx Ingress pour monitoring"
kubectl apply -f ../ingress/nginx-monitoring-ingress.yaml

echo "🛡️ Phase 9: Security"
kubectl apply -f ../security/network-policies.yaml

echo "🛡️ Phase 10: Autoscaling"
echo "Work in progress"

echo "✅ Déploiement nginx terminé!"
echo ""
echo "📱 Applications accessibles via:"
echo "   - App principale: https://query-forge-dev.ualtarh.com"
echo "   - API: https://api.ualtarh.com"
echo "   - Auth: https://auth.ualtarh.com"
echo "   - Agent IA: https://agent.ualtarh.com"
echo "   - Scraping: https://scraping.ualtarh.com"
echo "   - Kibana: https://kibana.ualtarh.com"
echo "   - Adminer: https://adminer.ualtarh.com"
echo ""
echo "📊 Monitoring accessibles via:"
echo "   - Grafana: https://grafana.ualtarh.com (admin/admin123)"
echo "   - Prometheus: https://prometheus.ualtarh.com"
echo ""
echo "🛡️ Fonctionnalités nginx activées:"
echo "   ✅ Redirection automatique HTTP → HTTPS"
echo "   ✅ Certificats SSL Let's Encrypt via Cloudflare"
echo "   ✅ Métriques Prometheus intégrées"
echo "   ✅ Load balancing automatique"
echo "   ✅ Sécurisation des routes /metrics"
echo ""
echo "🔧 Vérifications utiles:"
echo "   kubectl get pods -n nginx-ingress"
echo "   kubectl get pods -n cert-manager"
echo "   kubectl get certificates -n query-forge-dev"
echo "   kubectl describe certificate query-forge-tls -n query-forge-dev"