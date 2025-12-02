#!/bin/bash

set -e

echo "Testando via API Gateway..."
echo ""

curl -s http://localhost:8000
echo ""

curl -s http://localhost:8000/health
echo ""

curl -s http://localhost:8000/users
echo ""

curl -s -X POST http://localhost:8000/users \
	-H "Content-Type: application/json" \
	-d '{"nome":"Joao Silva","email":"joao@teste.com"}'
echo ""

curl -s http://localhost:8000/orders
echo ""

curl -s -X POST http://localhost:8000/orders \
	-H "Content-Type: application/json" \
	-d '{"usuario_id":1,"produto":"Notebook","valor":2500}'
echo ""

curl -s http://localhost:8000/orders
echo ""

echo "Testes concluidos"
