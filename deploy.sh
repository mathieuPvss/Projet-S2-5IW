#!/bin/bash
set -a  # Exporte automatiquement toutes les variables
source .env
set +a
sudo docker stack deploy -c docker-compose.swarm.yml query-forge-dev