# Desafio 5

Criar arquitetura de microsserviços com API Gateway como ponto único de entrada.

## Arquitetura

### Sistema com:

#### 1. API Gateway
  - Node.js (Express)
  - Porta 8000
  - Ponto único de entrada
  - Roteia para users-service e orders-service
#### 2. Users Service
  - Node.js (Express)
  - Porta 3001
  - Gerencia usuários
#### 3. Orders Service
  - Node.js (Express)
  - Porta 3002
  - Gerencia pedidos
  - Valida usuários via users-service

## Componentes

### 1. Gateway
- Ponto único de entrada na porta 8000
- Roteia requisições para microsserviços
- Health check agregado de todos os serviços
- Endpoints: /, /health, /users, /users/:id, /orders, /orders/:id

### 2. Users Service
- API REST na porta 3001
- Gerencia dados de usuários
- Endpoints: /, /users, /users/:id, /health

### 3. Orders Service
- API REST na porta 3002
- Gerencia pedidos
- Valida usuários via HTTP para users-service
- Endpoints: /, /orders, /orders/:id, /health

## Como executar:

### 1. Iniciar serviços

```bash
cd desafio5

docker-compose up -d
```

### 2. Verificar status

```bash
docker-compose ps

docker-compose logs -f
```

### Script de execução:

Há um script de execução na pasta do desafio, basta rodar o comando:
```bash
chmod +x ./run.sh

./run.sh
```

### 3. Testar via Gateway

```bash
curl http://localhost:8000

curl http://localhost:8000/health

curl http://localhost:8000/users

curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Joao Silva","email":"joao@teste.com"}'

curl http://localhost:8000/orders

curl -X POST http://localhost:8000/orders \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":1,"produto":"Notebook","valor":2500}'
```

### Script de testes:

```bash
chmod +x ./test.sh

./test.sh
```

### 4. Encerrar e limpar

```bash
docker-compose down

docker-compose down --rmi all
```

Script de limpeza:
```bash
chmod +x ./cleanup.sh

./cleanup.sh
```

## Exemplos de resposta:

### Gateway - GET /:
```json
{
  "service": "api-gateway",
  "version": "1.0.0",
  "services": {
    "users": "http://users-service:3001",
    "orders": "http://orders-service:3002"
  },
  "endpoints": [
    "GET /health",
    "GET /users",
    "POST /users",
    "GET /orders",
    "POST /orders"
  ]
}
```

### Gateway - GET /health:
```json
{
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2024-11-26T15:30:00.000Z",
  "services": {
    "users-service": {
      "status": "healthy",
      "url": "http://users-service:3001"
    },
    "orders-service": {
      "status": "healthy",
      "url": "http://orders-service:3002"
    }
  }
}
```

### Gateway - GET /users:
```json
{
  "service": "users-service",
  "total": 3,
  "users": [
    {
      "id": 1,
      "nome": "Joao Silva",
      "email": "joao@email.com",
      "ativo": true
    }
  ]
}
```

### Gateway - POST /orders:
```json
{
  "service": "orders-service",
  "message": "Pedido criado",
  "order": {
    "id": 2,
    "usuario_id": 1,
    "usuario_nome": "Joao Silva",
    "produto": "Notebook",
    "valor": 2500,
    "status": "pendente",
    "criado_em": "2024-11-26T15:30:00.000Z"
  }
}
```

## Funcionamento:

### 1. API Gateway como ponto único:
   - Todas as requisições passam pelo Gateway (porta 8000)
   - Gateway roteia para microsserviço apropriado
   - Cliente não acessa microsserviços diretamente
   - Centraliza controle de acesso

### 2. Roteamento de requests:
   - Cliente: curl http://localhost:8000/users
   - Gateway recebe requisição
   - Gateway identifica rota /users
   - Gateway faz proxy para http://users-service:3001/users
   - Users Service processa e responde
   - Gateway retorna resposta ao cliente

### 3. Comunicação entre microsserviços:
   - Orders Service precisa validar usuário
   - Faz requisição HTTP para Users Service
   - DNS Docker resolve "users-service" para IP
   - Users Service valida e responde
   - Orders Service cria pedido com dados validados

### 4. Health check agregado:
   - Gateway consulta health de todos os microsserviços
   - Retorna status consolidado
   - Identifica qual serviço está com problema
   - Status geral: healthy ou degraded

### 5. Orquestração com Docker Compose:
   - Define os 3 serviços
   - Configura dependências (depends_on)
   - Cria rede interna (gateway_network)
   - Expõe apenas porta 8000 do Gateway
