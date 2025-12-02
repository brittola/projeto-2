#!/bin/bash

set -e

echo "Parando e removendo containers..."
docker-compose down

echo "Removendo imagens..."
docker-compose down --rmi all 2>/dev/null || true

echo "Limpeza concluida"
