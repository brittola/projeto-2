#!/bin/bash

set -e

echo "Criando rede 'rede-desafio1'..."
docker network create rede-desafio1

echo "Construindo imagem do servidor..."
docker build -t servidor-web:v1 -f Dockerfile.servidor .

echo "Construindo imagem do cliente..."
docker build -t cliente-curl:v1 -f Dockerfile.cliente .

echo "Iniciando container servidor..."
docker run -d \
  --name servidor-web \
  --network rede-desafio1 \
  -p 8080:8080 \
  servidor-web:v1

sleep 2

echo "Iniciando container cliente..."
docker run -d \
  --name cliente-curl \
  --network rede-desafio1 \
  cliente-curl:v1

echo "Containers em execução"
