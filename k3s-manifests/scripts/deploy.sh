#!/bin/bash

echo "🚀 Déploiement complet sur K3s avec Traefik..."

# Créer les répertoires de données sur les nœuds
echo "📁 Création des répertoires de données (traefik, prometheus, grafana, bases de données)"
sudo mkdir -p /var/lib/k3s/storage/{postgres,elasticsearch}
sudo mkdir -p /data/{traefik,prometheus,grafana}
sudo chmod 777 /var/lib/k3s/storage/{postgres,elasticsearch}
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

echo "🌐 Phase 8: Traefik avec NodePort"
kubectl apply -f ../traefik/helmChartConfig-traefik.yaml
kubectl apply -f ../traefik/middleware-redirect.yaml
kubectl apply -f ../traefik/traefik-service.yaml

echo "⏳ Attente du redémarrage automatique de Traefik..."
kubectl rollout restart deployment/traefik -n kube-system
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
echo "📱 Applications accessibles via NodePort:"
echo "   - HTTP: http://192.168.1.181:30080"
echo "   - HTTPS: https://192.168.1.181:30443"
echo "   - Traefik Dashboard: http://192.168.1.181:30900"
echo ""
echo "📱 Applications accessibles via domaines (si Cloudflare configuré):"
echo "   - App principale: https://query-forge-dev.ualtarh.com"
echo "   - Kibana: https://kibana.ualtarh.com"
echo "   - Adminer: https://adminer.ualtarh.com"
echo ""
echo "📊 Monitoring accessibles via:"
echo "   - Grafana: https://grafana.ualtarh.com (admin/admin123)"
echo "   - Traefik Dashboard: https://traefik.ualtarh.com"
echo ""
echo "🛡️ Fonctionnalités Traefik activées:"
echo "   ✅ Redirection automatique HTTP → HTTPS"
echo "   ✅ Certificats SSL auto-signés"
echo "   ✅ Métriques Prometheus intégrées"
echo "   ✅ Dashboard Traefik avec authentification"
echo "   ✅ Load balancing automatique"
echo "   ✅ securisation des routes /metrics"
echo "   ✅ NodePort configuration (30080/30443/30900)"
echo ""
echo "🔍 Vérification du statut:"
echo "   kubectl get svc -n kube-system | grep traefik"
echo "   kubectl get pods -n query-forge-dev"
echo "   kubectl get ingress -n query-forge-dev"
