# Desafio 4

Criar dois microsserviços independentes que se comunicam via HTTP.

## Arquitetura

### Sistema com:

#### 1. Microsserviço A (users-service)
  - Node.js (Express)
  - Porta 3001
  - Lista de usuários
#### 2. Microsserviço B (info-service)
  - Node.js (Express)
  - Porta 3002
  - Consome serviço A e adiciona informações

## Componentes

### 1. Users Service (Microsserviço A)
- API REST na porta 3001
- Retorna lista de usuários em JSON
- Endpoints: /, /users, /users/:id, /health

### 2. Info Service (Microsserviço B)
- API REST na porta 3002
- Consome users-service via HTTP
- Adiciona informações complementares aos usuários
- Endpoints: /, /info, /info/:id, /health

## Como executar:

### 1. Criar rede Docker

```bash
cd desafio4

docker network create microservices_net
```

### 2. Construir imagens

```bash
docker build -t users-service:v1 -f service-a/Dockerfile service-a/

docker build -t info-service:v1 -f service-b/Dockerfile service-b/
```

### 3. Iniciar microsserviços

```bash
docker run -d \
  --name users-service \
  --network microservices_net \
  -p 3001:3001 \
  users-service:v1

sleep 2

docker run -d \
  --name info-service \
  --network microservices_net \
  -p 3002:3002 \
  -e USERS_SERVICE_URL=http://users-service:3001 \
  info-service:v1
```

### Script de execução:

Há um script de execução na pasta do desafio, basta rodar o comando:
```bash
chmod +x ./run.sh

./run.sh
```

### 4. Testar comunicação

```bash
curl http://localhost:3001/users

curl http://localhost:3002/info

curl http://localhost:3002/info/1
```

### Script de testes:

```bash
chmod +x ./test.sh

./test.sh
```

### 5. Encerrar e limpar

```bash
docker stop users-service info-service

docker rm users-service info-service

docker rmi users-service:v1 info-service:v1

docker network rm microservices_net
```

Script de limpeza:
```bash
chmod +x ./cleanup.sh

./cleanup.sh
```

## Exemplos de resposta:

### Users Service - GET /users:
```json
{
  "service": "users-service",
  "total": 4,
  "users": [
    {
      "id": 1,
      "nome": "Joao Silva",
      "email": "joao@email.com",
      "idade": 28
    }
  ]
}
```

### Info Service - GET /info:
```json
{
  "service": "info-service",
  "source": "users-service",
  "total": 4,
  "users_info": [
    {
      "id": 1,
      "nome": "Joao Silva",
      "email": "joao@email.com",
      "idade": 28,
      "status": "ativo",
      "membro_desde": "2022-01-15",
      "categoria": "adulto",
      "nivel": "junior"
    }
  ],
  "timestamp": "2024-11-26T15:30:00.000Z"
}
```

### Info Service - GET /info/1:
```json
{
  "service": "info-service",
  "source": "users-service",
  "user": {
    "id": 1,
    "nome": "Joao Silva",
    "email": "joao@email.com",
    "idade": 28,
    "status": "ativo",
    "membro_desde": "2022-01-15",
    "categoria": "adulto",
    "nivel": "junior"
  },
  "timestamp": "2024-11-26T15:30:00.000Z"
}
```

## Funcionamento:

### 1. Isolamento:
   - Cada microsserviço tem seu próprio código
   - Roda em seu próprio container Docker
   - Tem seu próprio Dockerfile
   - Expõe sua própria porta

### 2. Comunicação http:
   - Cliente faz requisição para Info Service (porta 3002)
   - Info Service faz requisição http para Users Service (porta 3001)
   - DNS Docker resolve "users-service" para IP do container
   - Users Service responde com dados dos usuários
   - Info Service combina com informações adicionais
   - Retorna resposta completa ao cliente

### 3. Service discovery via DNS:
   - Docker cria DNS automático na rede customizada
   - Nome do container vira hostname na rede
   - "users-service" resolve para IP do container
   - Permite comunicação usando nomes ao invés de IPs

### 4. Variável de ambiente:
   - USERS_SERVICE_URL configurável via variável
   - Permite flexibilidade para diferentes ambientes
   - Separação de configuração e código
