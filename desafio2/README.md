# Desafio 2

Demonstrar persistência de dados usando volumes Docker.

## Arquitetura

### Sistema de persistência com:

#### 1. Container PostgreSQL
  - Banco de dados oficial
  - Porta 5432
  - Volume nomeado para persistência
#### 2. Container Node.js
  - Script de manipulação de dados
  - Cria tabela e insere registros
  - Consulta dados do banco
#### 3. Volume Docker
  - Nome: postgres_data_desafio2
  - Armazena dados do PostgreSQL
  - Persiste independentemente dos containers

## Componentes

### 1. PostgreSQL
- Imagem oficial postgres:15-alpine
- Configurado com usuário, senha e database via variáveis de ambiente
- Dados salvos em /var/lib/postgresql/data (montado no volume)

### 2. Aplicação Node.js
- Conecta ao PostgreSQL via biblioteca pg
- Cria tabela usuarios (se não existir)
- Insere 3 registros de exemplo
- Consulta e exibe dados cadastrados

### 3. Volume Nomeado
- Gerenciado pelo Docker
- Localização: /var/lib/docker/volumes/postgres_data_desafio2/_data
- Sobrevive à remoção de containers

## Como executar:

### 1. Criar o volume

```bash
cd desafio2

docker volume create postgres_data_desafio2
```

### 2. Iniciar o PostgreSQL

```bash
docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=desafio2 \
  -e POSTGRES_DB=desafio2 \
  -v postgres_data_desafio2:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

### 3. Aguardar inicialização

```bash
sleep 5

docker logs postgres-db
```

### 4. Construir e executar aplicação

```bash
docker build -t app-postgres:v1 .

docker run --rm \
  --link postgres-db:db \
  app-postgres:v1 insert
```

### 5. Consultar dados

```bash
docker run --rm \
  --link postgres-db:db \
  app-postgres:v1 select
```

### Script de execução:

Há um script de execução na pasta do desafio, basta rodar o comando:
```bash
chmod +x ./run.sh

./run.sh
```

### 6. Testar persistência

```bash
docker rm -f postgres-db

docker run -d \
  --name postgres-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=desafio2 \
  -e POSTGRES_DB=desafio2 \
  -v postgres_data_desafio2:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

sleep 5

docker run --rm \
  --link postgres-db:db \
  app-postgres:v1 select
```

### Script de teste de persistência:

```bash
chmod +x ./test-persistence.sh

./test-persistence.sh
```

### 7. Limpeza

```bash
docker rm -f postgres-db

docker rmi app-postgres:v1

docker volume rm postgres_data_desafio2
```

Script de limpeza:
```bash
chmod +x ./cleanup.sh

./cleanup.sh
```

## Exemplos dos logs:

### Inserindo dados:
```
Conectado ao PostgreSQL
Tabela de usuários criada com sucesso
Inserindo dados iniciais...
Dados inseridos com sucesso
Usuários cadastrados:
ID: 1 | Nome: João Silva | Email: joao@email.com
ID: 2 | Nome: Maria Santos | Email: maria@email.com
ID: 3 | Nome: Pedro Oliveira | Email: pedro@email.com
Total: 3 usuários
Conexão fechada
```

### Consultando dados:
```
Conectado ao PostgreSQL
Tabela de usuários criada com sucesso
Usuários cadastrados:
ID: 1 | Nome: João Silva | Email: joao@email.com
ID: 2 | Nome: Maria Santos | Email: maria@email.com
ID: 3 | Nome: Pedro Oliveira | Email: pedro@email.com
Total: 3 usuários
Conexão fechada
```

## Funcionamento:

### 1. Criação do Volume:
   - Docker cria espaço de armazenamento gerenciado
   - Localização interna em /var/lib/docker/volumes
   - Independente do ciclo de vida dos containers

### 2. Container PostgreSQL:
   - Inicia com o volume montado em /var/lib/postgresql/data
   - Todas as escritas do banco vão para o volume
   - Se o container for removido, dados permanecem no volume

### 3. Container Aplicação:
   - Conecta ao PostgreSQL via link (resolve nome do container)
   - Executa comandos SQL (CREATE TABLE, INSERT, SELECT)
   - Container é efêmero (--rm), removido após execução

### 4. Persistência:
   - Dados escritos vão para o volume, não para o container
   - Volume permanece após remoção do container
   - Novo container montando o mesmo volume acessa os mesmos dados
