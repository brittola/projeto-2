#!/bin/bash

set -e

echo "Iniciando servicos com Docker Compose..."
docker-compose up -d --build

echo "Aguardando servicos iniciarem..."
sleep 5

echo "Servicos em execucao"
