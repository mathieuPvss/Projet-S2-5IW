#!/bin/bash

echo "🔍 Vérification du déploiement complet..."

echo ""
echo "📊 Statut des services Traefik:"
kubectl get svc -n kube-system | grep traefik

echo ""
echo "🌐 Configuration Traefik:"
echo "   - Type: NodePort"
echo "   - HTTP: 30080"
echo "   - HTTPS: 30443"
echo "   - Dashboard: 30900"

echo ""
echo "🔗 URLs d'accès direct:"
echo "   - HTTP: http://192.168.1.181:30080"
echo "   - HTTPS: https://192.168.1.181:30443"
echo "   - Traefik Dashboard: http://192.168.1.181:30900"

echo ""
echo "📱 Applications accessibles:"
echo "   - Frontend: https://query-forge-dev.ualtarh.com"
echo "   - API: https://api.ualtarh.com"
echo "   - Auth: https://auth.ualtarh.com"
echo "   - Agent: https://agent.ualtarh.com"
echo "   - Scraping: https://scraping.ualtarh.com"

echo ""
echo "📋 Statut des pods par namespace:"
echo "   Kube-system (Traefik):"
kubectl get pods -n kube-system | grep traefik
echo ""
echo "   Query-forge-dev (Applications):"
kubectl get pods -n query-forge-dev
echo ""
echo "   Monitoring:"
kubectl get pods -n monitoring

echo ""
echo "🔍 Logs Traefik (dernières 10 lignes):"
kubectl logs -n kube-system deployment/traefik --tail=10

echo ""
echo "🌍 Test de connectivité HTTP:"
curl -I http://192.168.1.181:30080 2>/dev/null | head -1 || echo "❌ HTTP NodePort non accessible"

echo ""
echo "🔒 Test de connectivité HTTPS:"
curl -I -k https://192.168.1.181:30443 2>/dev/null | head -1 || echo "❌ HTTPS NodePort non accessible"

echo ""
echo "📊 Services et Ingress:"
kubectl get svc -n kube-system | grep traefik
echo ""
kubectl get ingress -n query-forge-dev

echo ""
echo "✅ Vérification terminée!" 