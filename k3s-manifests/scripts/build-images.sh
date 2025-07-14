#!/bin/bash

echo "🏗️ Construction des images Docker..."

# Variables
REGISTRY="mathieuvss"
TAG=${1:-latest}

# Construire et pousser les images
echo "📦 Frontend..."
docker build -t $REGISTRY/query-forge-frontend:$TAG ../../frontend
docker push $REGISTRY/query-forge-frontend:$TAG

echo "📦 NestJS..."
docker build -t $REGISTRY/query-forge-nestjs:$TAG ../../backend/query-forge-dev
docker push $REGISTRY/query-forge-nestjs:$TAG

echo "📦 Auth Service..."
docker build -t $REGISTRY/auth-service:$TAG ../../backend/auth-service
docker push $REGISTRY/auth-service:$TAG

echo "📦 Agent IA Service..."
docker build -t $REGISTRY/agent-ia-service:$TAG ../../backend/agent-ia-service
docker push $REGISTRY/agent-ia-service:$TAG

echo "📦 Sync Service..."
docker build -t $REGISTRY/sync-service:$TAG ../../backend/sync-service
docker push $REGISTRY/sync-service:$TAG

echo "📦 Scraping Service..."
docker build -t $REGISTRY/scraping-service:$TAG ../../backend/scraping-service
docker push $REGISTRY/scraping-service:$TAG

echo "✅ Toutes les images sont construites et poussées!"