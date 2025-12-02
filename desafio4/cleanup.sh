#!/bin/bash

set -e

echo "Parando e removendo containers..."
docker stop users-service info-service 2>/dev/null || true
docker rm users-service info-service 2>/dev/null || true

echo "Removendo imagens..."
docker rmi users-service:v1 info-service:v1 2>/dev/null || true

echo "Removendo rede..."
docker network rm microservices_net 2>/dev/null || true

echo "Limpeza concluida"
