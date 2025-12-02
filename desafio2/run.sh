#!/bin/bash

set -e

echo "Criando volume 'postgres_data_desafio2'..."
docker volume create postgres_data_desafio2

echo "Iniciando PostgreSQL..."
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=desafio2 \
  -e POSTGRES_DB=desafio2 \
  -v postgres_data_desafio2:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

echo "Aguardando PostgreSQL iniciar..."
sleep 5

echo "Construindo imagem da aplicação..."
docker build -t app-postgres:v1 .

echo "Inserindo dados..."
docker run --rm \
  --link postgres-db:db \
  app-postgres:v1 insert

echo "Setup concluído"
