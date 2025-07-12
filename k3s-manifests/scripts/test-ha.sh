echo "🧪 Tests de haute disponibilité..."

# Test 1: Scaling horizontal
echo "📈 Test 1: Scaling horizontal..."
kubectl scale deployment nestjs --replicas=4 -n query-forge-dev
kubectl scale deployment auth --replicas=3 -n query-forge-dev
kubectl scale deployment frontend --replicas=5 -n query-forge-dev

echo "⏳ Attente du scaling..."
sleep 30

echo "✅ État après scaling:"
kubectl get pods -n query-forge-dev -l app=nestjs
kubectl get pods -n query-forge-dev -l app=auth
kubectl get pods -n query-forge-dev -l app=frontend

# Test 2: Résistance aux pannes
echo ""
echo "💀 Test 2: Résistance aux pannes..."
POD_NESTJS=$(kubectl get pods -n query-forge-dev -l app=nestjs -o jsonpath='{.items[0].metadata.name}')
POD_FRONTEND=$(kubectl get pods -n query-forge-dev -l app=frontend -o jsonpath='{.items[0].metadata.name}')

echo "🔪 Suppression de pods: $POD_NESTJS, $POD_FRONTEND"
kubectl delete pod $POD_NESTJS -n query-forge-dev
kubectl delete pod $POD_FRONTEND -n query-forge-dev

echo "⏳ Attente de la recréation automatique..."
sleep 30

echo "✅ État après suppression:"
kubectl get pods -n query-forge-dev

# Test 3: Load balancing
echo ""
echo "⚖️ Test 3: Load balancing..."
for i in {1..10}; do
    echo "Request $i:"
    curl -s -o /dev/null -w "%{http_code} - %{time_total}s\n" http://query-forge-dev.ualtarh.com
    sleep 1
done

echo ""
echo "✅ Tests de haute disponibilité terminés!"