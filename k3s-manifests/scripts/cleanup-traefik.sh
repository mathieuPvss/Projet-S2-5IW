#!/bin/bash

echo "🧹 Nettoyage du cluster Traefik..."

# Supprimer les ingress Traefik
echo "🌍 Suppression des ingress Traefik..."
kubectl delete -f ../ingress/app-ingress.yaml --ignore-not-found
kubectl delete -f ../ingress/monitoring-ingress.yaml --ignore-not-found
kubectl delete -f ../ingress/traefik-ingress.yaml --ignore-not-found

# Supprimer la configuration Traefik
echo "🌐 Suppression de Traefik..."
kubectl delete -f ../traefik/traefik-service.yaml --ignore-not-found
kubectl delete -f ../traefik/middleware-redirect.yaml --ignore-not-found
kubectl delete -f ../traefik/helmChartConfig-traefik.yaml --ignore-not-found

# Redémarrer K3s pour supprimer Traefik complètement
echo "🔄 Redémarrage de K3s pour supprimer Traefik..."
sudo systemctl restart k3s

echo "⏳ Attente du redémarrage de K3s... (30s)"
sleep 30

# Vérifier que Traefik n'est plus là
echo "🔍 Vérification que Traefik est supprimé..."
kubectl get pods -n kube-system | grep traefik || echo "✅ Traefik supprimé avec succès"

echo "✅ Nettoyage Traefik terminé!"