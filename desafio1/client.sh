#!/bin/sh

echo "Cliente iniciado. Fazendo requisições para o servidor..."
echo ""

while true; do
  echo "Requisição em $(date)"
  curl -s http://servidor-web:8080
  echo ""
  sleep 3
done
