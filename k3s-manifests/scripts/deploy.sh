#!/bin/bash

echo "🚀 Déploiement complet sur K3s avec Traefik..."

# Créer les répertoires de données sur les nœuds
echo "📁 Création des répertoires de données (traefik, prometheus, grafana)"
sudo mkdir -p /data/{traefik,prometheus,grafana}
sudo chmod 777 /data/{traefik,prometheus,grafana}

# Déploiement par étapes
echo "🏗️ Phase 1: Namespaces et configuration de base..."
kubectl apply -f ../namespace/
kubectl apply -f ../secrets/
kubectl apply -f ../configmaps/

echo "💾 Phase 2: Volumes persistants..."
kubectl apply -f ../persistent-volumes/

echo "⏳ Attente de la création des volumes... (10s)"
sleep 10

echo "🗄️ Phase 3: Bases de données postgres et elasticsearch"
kubectl apply -f ../databases/postgres-external.yaml
kubectl apply -f ../databases/elasticsearch-external.yaml

echo "🗄️ Phase 3.1: Set up metrics for postgres and elasticsearch"
kubectl apply -f ../databases/postgres-metrics.yaml
kubectl apply -f ../databases/elasticsearch-metrics.yaml

echo "⏳ Attente du démarrage des bases de données... (30s)"
sleep 30

# Vérifier que les BD externes et métriques sont prêtes
chmod +x ./test-external-services.sh
./test-external-services.sh

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
kubectl apply -f ../monitoring/prometheus-configmap.yaml
kubectl apply -f ../monitoring/prometheus-deployment.yaml
echo "⚙️ Phase 6.2: Grafana"
kubectl apply -f ../monitoring/grafana-configmap.yaml
kubectl apply -f ../monitoring/grafana-deployment.yaml
echo "⚙️ Phase 6.3: Kibana"
kubectl apply -f ../monitoring/kibana.yaml


echo "🛠️ Phase 7: Outils (adminer)"
kubectl apply -f ../tools/adminer.yaml

echo "⏳ Attente du démarrage des services... (60s)"
sleep 60

echo "🌐 Phase 8: Traefik"
kubectl apply -f ../traefik/helmChartConfig-traefik.yaml
kubectl apply -f ../traefik/traefik-service.yaml

echo "⏳ Attente du redémarrage automatique de Traefik..."
kubectl rollout status deployment/traefik -n kube-system --timeout=300s

echo "🌍 Phase 9: Ingress"
kubectl apply -f ../ingress/app-ingress.yaml
echo "🌍 Phase 9.1: Ingress pour monitoring"
kubectl apply -f ../ingress/monitoring-ingress.yaml
echo "🌍 Phase 9.2: Ingress pour traefik"
kubectl apply -f ../ingress/traefik-ingress.yaml

echo "🛡️ Phase 10: Security"
kubectl apply -f ../security/network-policies.yaml

echo "🛡️ Phase 11: Autoscaling"
echo "Work in progress"

echo "✅ Déploiement terminé!"
echo ""
echo "📱 Applications accessibles via:"
echo "   - App principale: https://query-forge-dev.ualtarh.com (HTTP redirigé vers HTTPS)"
echo "   - Kibana: https://kibana.query-forge-dev.ualtarh.com"
echo "   - Adminer: https://adminer.query-forge-dev.ualtarh.com"
echo ""
echo "📊 Monitoring accessibles via:"
echo "   - Grafana: https://grafana.query-forge-dev.ualtarh.com (admin/admin123)"
echo "   - Traefik Dashboard: https://traefik.query-forge-dev.ualtarh.com"
echo ""
echo "🛡️ Fonctionnalités Traefik activées:"
echo "   ✅ Redirection automatique HTTP → HTTPS"
echo "   ✅ Certificats SSL auto-signés"
echo "   ✅ Métriques Prometheus intégrées"
echo "   ✅ Dashboard Traefik avec authentification"
echo "   ✅ Load balancing automatique"
echo "   ✅ securisation des routes /metrics"