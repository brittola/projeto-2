#!/bin/bash

set -e

echo "Criando rede Docker..."
docker network create microservices_net 2>/dev/null || true

echo "Construindo Microsservico A..."
docker build -t users-service:v1 -f service-a/Dockerfile service-a/

echo "Construindo Microsservico B..."
docker build -t info-service:v1 -f service-b/Dockerfile service-b/

echo "Iniciando Microsservico A..."
docker rm -f users-service 2>/dev/null || true
docker run -d \
	--name users-service \
	--network microservices_net \
	-p 3001:3001 \
	users-service:v1

sleep 3

echo "Iniciando Microsservico B..."
docker rm -f info-service 2>/dev/null || true
docker run -d \
	--name info-service \
	--network microservices_net \
	-p 3002:3002 \
	-e USERS_SERVICE_URL=http://users-service:3001 \
	info-service:v1

sleep 3

echo "Microsservicos em execucao"
