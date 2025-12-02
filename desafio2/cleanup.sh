#!/bin/bash

echo "Removendo container..."
docker rm -f postgres-db 2>/dev/null || true

echo "Removendo imagem..."
docker rmi app-postgres:v1 2>/dev/null || true

echo "Removendo volume..."
docker volume rm postgres_data_desafio2 2>/dev/null || true

echo "Limpeza concluída"
