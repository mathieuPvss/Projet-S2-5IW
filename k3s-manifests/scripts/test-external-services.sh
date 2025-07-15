#!/bin/bash
# Test des bases de données internes dans le cluster K3s
echo "🔍 Test de connectivité vers PostgreSQL interne..."
kubectl wait --for=condition=ready pod -l app=postgres -n query-forge-dev --timeout=300s && echo "   ✅ PostgreSQL accessible" || echo "   ❌ PostgreSQL inaccessible"

echo "🔍 Test de connectivité vers Elasticsearch interne..."
kubectl wait --for=condition=ready pod -l app=elasticsearch -n query-forge-dev --timeout=300s && echo "   ✅ Elasticsearch accessible" || echo "   ❌ Elasticsearch inaccessible"

echo "📊 Vérification que les exporters de métriques sont prêts..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres-metrics -n query-forge-dev
kubectl wait --for=condition=available --timeout=300s deployment/elasticsearch-metrics -n query-forge-dev

echo "🧪 Test des endpoints de métriques..."
echo "   📈 Test métriques PostgreSQL..."
kubectl run metrics-test-pg --rm -i --restart=Never --image=busybox -- timeout 5 wget -qO- http://postgres-service-metrics.query-forge-dev.svc.cluster.local:9187/metrics | head -3 && echo "   ✅ Métriques PostgreSQL OK" || echo "   ❌ Métriques PostgreSQL KO"

echo "   📈 Test métriques Elasticsearch..."
kubectl run metrics-test-es --rm -i --restart=Never --image=busybox -- timeout 5 wget -qO- http://elasticsearch-service-metrics.query-forge-dev.svc.cluster.local:9114/metrics | head -3 && echo "   ✅ Métriques Elasticsearch OK" || echo "   ❌ Métriques Elasticsearch KO"
