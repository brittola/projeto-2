#!/bin/bash

set -e

echo "Testando API..."
echo ""

curl -s http://localhost:3000
echo ""

curl -s http://localhost:3000/health
echo ""

curl -s http://localhost:3000/users
echo ""

curl -s -X POST http://localhost:3000/users \
	-H "Content-Type: application/json" \
	-d '{"nome":"Joao Silva","email":"joao@email.com"}'
echo ""

curl -s -X POST http://localhost:3000/users \
	-H "Content-Type: application/json" \
	-d '{"nome":"Maria Santos","email":"maria@email.com"}'
echo ""

curl -s http://localhost:3000/users
echo ""

echo "Testes concluidos"
