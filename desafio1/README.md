# Desafio 1

Demonstrar comunicação entre dois containers através de uma rede Docker customizada.

## Arquitetura

### Rede Docker com:

#### 1. Container Servidor
  - Node.js (Express)
  - Porta 8080
#### 2. Container Cliente
  - Bash + curl em loop
#### 3. Comunicação via http
  - Container Cliente <-- (http) --> Container Servidor

## Componentes

### 1. Servidor web
- Rodando na porta 8080
- Responde com informações sobre horário e hostname
- Loga cada requisição recebida

### 2. Cliente
- Executa requisições HTTP a cada 3 segundos (curl em loop)
- Loga resposta do servidor

### 3. Rede Docker Customizada
- Nome: `rede-desafio1`
- Driver: bridge (padrão)
- Permite comunicação isolada entre containers

## Como executar:

### 1. Construir as imagens

```bash
cd desafio1

docker build -t servidor-web:v1 -f Dockerfile.servidor .

docker build -t cliente-curl:v1 -f Dockerfile.cliente .
```

### 2. Criação da rede docker

```bash
docker network create rede-desafio1
```

### 3. Rodar o servidor

```bash
docker run -d \
  --name servidor-web \
  --network rede-desafio1 \
  -p 8080:8080 \
  servidor-web:v1
```

### 4. Rodar o cliente

```bash
docker run -d \
  --name cliente-curl \
  --network rede-desafio1 \
  cliente-curl:v1
```

### Script de execução:

Há um script de execução na pasta do desafio, basta rodar o comando:
```bash
chmod +x ./run.sh

./run.sh
```
Obs.: o script roda apenas os passos 1 a 4. Para conferir logs ou remover os containers e a network, você deve seguir os passos abaixo.

### 5. Verificação de logs

```bash
docker logs -f servidor-web

docker logs -f cliente-curl
```

O servidor pode ser testado acessando a porta 8080 local:

```bash
curl http://localhost:8080
```

### 6. Como encerrar e remover o servidor, o cliente e a rede:
```bash
docker rm -f servidor-web cliente-curl

docker network rm rede-desafio1
```

## Exemplos dos logs:

### Servidor:
```
Servidor rodando na porta 8080
Requisição recebida de ::ffff:172.18.0.3
Requisição recebida de ::ffff:172.18.0.3
```

### Cliente:
```
Requisição em 2024-11-26 15:30:00
{"message":"Olá do servidor!","timestamp":"...","hostname":"..."}
```

## Funcionamento:

### 1. Criação da Rede:
   - Docker cria uma rede bridge virtual
   - Atribui um range de IPs privados (ex: 172.18.0.0/16)
   - Configura DNS interno para resolução de nomes

### 2. Container Servidor:
   - Inicia aplicação Node.js/Express
   - Escuta na porta 8080
   - Se registra no DNS da rede como "servidor-web"

### 3. Container Cliente:
   - Inicia script bash em loop
   - Resolve "servidor-web" para o IP do container servidor
   - Faz requisição HTTP usando curl
   - Aguarda 3 segundos e repete

### 4. Comunicação:
   - Cliente: `curl http://servidor-web:8080`
   - DNS resolve "servidor-web" → IP do container
   - TCP/IP estabelece conexão
   - Servidor processa e responde
   - Cliente recebe e loga resposta
