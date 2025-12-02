#!/bin/bash

set -e

echo "Consultando dados antes da remoção..."
docker run --rm \
  --link postgres-db:db \
  app-postgres:v1 select

echo ""
echo "Removendo container PostgreSQL..."
docker rm -f postgres-db

echo "Recriando container com mesmo volume..."
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=desafio2 \
  -e POSTGRES_DB=desafio2 \
  -v postgres_data_desafio2:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

echo "Aguardando PostgreSQL reiniciar..."
sleep 5

echo "Consultando dados após recriação..."
docker run --rm \
  --link postgres-db:db \
  app-postgres:v1 select

echo ""
echo "Persistência comprovada"
