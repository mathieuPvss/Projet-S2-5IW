#!/bin/bash

echo "🧪 Test complet du cluster nginx..."

echo "📊 Vérification des namespaces..."
kubectl get namespaces

echo ""
echo "🔍 Vérification nginx-ingress..."
kubectl get pods -n nginx-ingress
kubectl get svc -n nginx-ingress

echo ""
echo "🔐 Vérification cert-manager..."
kubectl get pods -n cert-manager
kubectl get clusterissuer
kubectl get certificates -n query-forge-dev

echo ""
echo "🗄️ Vérification des bases de données..."
kubectl get pods -n query-forge-dev | grep -E "(postgres|elasticsearch)"

echo ""
echo "⚙️ Vérification des services backend..."
kubectl get pods -n query-forge-dev | grep -E "(auth|nestjs|agent|scraping|sync)"

echo ""
echo "🌐 Vérification du frontend..."
kubectl get pods -n query-forge-dev | grep frontend

echo ""
echo "📊 Vérification du monitoring..."
kubectl get pods -n query-forge-dev | grep -E "(grafana|prometheus|kibana)"

echo ""
echo "🌍 Vérification des ingress..."
kubectl get ingress -n query-forge-dev

echo ""
echo "🔗 Test de connectivité externe..."
echo "Test HTTPS pour query-forge-dev.ualtarh.com:"
curl -I https://query-forge-dev.ualtarh.com || echo "❌ Échec connexion frontend"

echo ""
echo "Test HTTPS pour api.ualtarh.com:"
curl -I https://api.ualtarh.com/api || echo "❌ Échec connexion API"

echo ""
echo "🔐 Statut des certificats SSL..."
kubectl describe certificate query-forge-tls -n query-forge-dev | grep -A 5 "Status:"

echo ""
echo "📋 Logs nginx-ingress (dernières 10 lignes)..."
kubectl logs -n nginx-ingress deployment/nginx-ingress-controller --tail=10

echo ""
echo "📋 Logs cert-manager (dernières 10 lignes)..."
kubectl logs -n cert-manager deployment/cert-manager --tail=10

echo ""
echo "✅ Test terminé! Vérifie les résultats ci-dessus."