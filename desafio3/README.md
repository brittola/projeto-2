# Desafio 3

Orquestrar três serviços com Docker Compose demonstrando comunicação, dependências e persistência.

## Arquitetura

### Sistema com:

#### 1. API
  - Node.js (Express)
  - Porta 3000
  - API REST com 4 endpoints
#### 2. Serviço DB
  - PostgreSQL
  - Volume para persistência
  - Rede interna
#### 3. Serviço Cache
  - Redis
  - Volume para persistência
  - Rede interna

## Componentes

### 1. API (Node.js)
- API REST na porta 3000
- Conecta ao PostgreSQL para persistir usuários
- Usa Redis para contador de visitas
- Endpoints: /, /health, /users (GET/POST)

### 2. Postgres
- Banco de dados relacional
- Tabela usuarios (id, nome, email, criado_em)
- Volume postgres_data para persistência
- Acessível apenas via rede interna

### 3. Redis
- Cache em memória
- Armazena contador de visitas
- Volume redis_data para persistência
- Acessível apenas via rede interna

## Como executar:

### 1. Iniciar serviços

```bash
cd desafio3

docker-compose up -d
```

### 2. Verificar status

```bash
docker-compose ps

docker-compose logs -f web
```

### Script de execução:

Há um script de execução na pasta do desafio, basta rodar o comando:
```bash
chmod +x ./run.sh

./run.sh
```

### 3. Testar API

```bash
curl http://localhost:3000

curl http://localhost:3000/health

curl http://localhost:3000/users

curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Joao Silva","email":"joao@email.com"}'

curl http://localhost:3000/users
```

### Script de testes:

```bash
chmod +x ./test.sh

./test.sh
```

### 4. Encerrar e limpar

```bash
docker-compose down

docker-compose down -v
```

Script de limpeza:
```bash
chmod +x ./cleanup.sh

./cleanup.sh
```

## Exemplos dos logs:

### Web:
```
Conectado ao Redis
Banco conectado com sucesso
Tabela usuarios criada
Servidor rodando na porta 3000
```

### Resposta GET /:
```json
{
  "message": "API funcionando",
  "visitas": 1,
  "timestamp": "2024-11-26T15:30:00.000Z",
  "servicos": {
    "database": "PostgreSQL",
    "cache": "Redis"
  }
}
```

### Resposta GET /health:
```json
{
  "status": "ok",
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

### Resposta GET /users:
```json
{
  "total": 2,
  "users": [
    {
      "id": 1,
      "nome": "Joao Silva",
      "email": "joao@email.com",
      "criado_em": "2024-11-26T15:30:00.000Z"
    }
  ]
}
```

## Funcionamento:

### 1. Docker Compose:
   - Orquestra os 3 serviços
   - Cria rede interna (app_network)
   - Gerencia volumes para persistência
   - Define ordem de inicialização via depends_on

### 2. Ordem de Inicialização:
   - Banco inicia primeiro e aguarda healthcheck
   - Cache inicia e aguarda healthcheck
   - API inicia após DB e Cache estarem prontos
   - API conecta aos serviços via DNS interno

### 3. Comunicação:
   - API acessa banco via hostname "db" (porta 5432)
   - API acessa redis via hostname "cache" (porta 6379)
   - DNS interno do Docker resolve nomes para IPs
   - Apenas porta 3000 da API exposta ao host

### 4. Persistência:
   - Volume postgres_data armazena dados do PostgreSQL
   - Volume redis_data armazena dados do Redis
   - Dados sobrevivem a reinicializações dos containers
   - docker-compose down -v remove volumes
