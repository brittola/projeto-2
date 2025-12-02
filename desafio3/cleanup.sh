#!/bin/bash

set -e

echo "Parando e removendo containers..."
docker-compose down

echo "Removendo volumes..."
docker-compose down -v

echo "Limpeza concluida"

