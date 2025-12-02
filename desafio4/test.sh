#!/bin/bash

set -e

echo "Testando Microsservico A..."
echo ""

curl -s http://localhost:3001/users
echo ""

curl -s http://localhost:3001/users/1
echo ""

curl -s http://localhost:3001/health
echo ""

echo "Testando Microsservico B..."
echo ""

curl -s http://localhost:3002/info
echo ""

curl -s http://localhost:3002/info/1
echo ""

curl -s http://localhost:3002/health
echo ""

echo "Testes concluidos"
