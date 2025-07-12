#!/bin/bash
# todo: change ip 
echo "🔍 Test de connectivité vers PostgreSQL LXC (192.168.1.xxx:5432)..."
timeout 10 bash -c 'until nc -z 192.168.1.42 5432; do echo "   ⏳ Attente PostgreSQL..."; sleep 2; done' && echo "   ✅ PostgreSQL accessible" || echo "   ❌ PostgreSQL inaccessible"

echo "🔍 Test de connectivité vers Elasticsearch LXC (192.168.1.xxx:9200)..."
timeout 10 bash -c 'until nc -z 192.168.1.44 9200; do echo "   ⏳ Attente Elasticsearch..."; sleep 2; done' && echo "   ✅ Elasticsearch accessible" || echo "   ❌ Elasticsearch inaccessible"

echo "📊 Vérification que les exporters de métriques sont prêts..."
kubectl wait --for=condition=available --timeout=300s deployment/postgres-metrics -n query-forge-dev
kubectl wait --for=condition=available --timeout=300s deployment/elasticsearch-metrics -n query-forge-dev

echo "🧪 Test des endpoints de métriques..."
echo "   📈 Test métriques PostgreSQL..."
kubectl run metrics-test-pg --rm -i --restart=Never --image=busybox -- timeout 5 wget -qO- http://postgres-service-metrics.query-forge-dev.svc.cluster.local:9187/metrics | head -3 && echo "   ✅ Métriques PostgreSQL OK" || echo "   ❌ Métriques PostgreSQL KO"

echo "   📈 Test métriques Elasticsearch..."
kubectl run metrics-test-es --rm -i --restart=Never --image=busybox -- timeout 5 wget -qO- http://elasticsearch-service-metrics.query-forge-dev.svc.cluster.local:9108/metrics | head -3 && echo "   ✅ Métriques Elasticsearch OK" || echo "   ❌ Métriques Elasticsearch KO"