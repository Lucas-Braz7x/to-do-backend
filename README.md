# Desafio Backend - API de Gerenciamento de Tarefas

API RESTful para gerenciamento de tarefas com autenticação JWT, construída com NestJS e Prisma.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Endpoints da API](#endpoints-da-api)
- [Autenticação](#autenticação)
- [Testes](#testes)
- [Deploy](#deploy)

---

## Visão Geral

Esta API permite que usuários:

- Se registrem e autentiquem usando email e senha
- Gerenciem suas tarefas pessoais (criar, listar, editar, deletar)
- Visualizem apenas suas próprias tarefas (isolamento por usuário)

Principais características:

- ✅ Autenticação JWT
- ✅ Soft delete de tarefas (com possibilidade de restauração)
- ✅ Validação de dados com class-validator
- ✅ Testes unitários e E2E
- ✅ Pronto para deploy no Render

---

## Tecnologias

| Tecnologia     | Versão  | Descrição                                     |
| -------------- | ------- | --------------------------------------------- |
| **NestJS**     | ^11.0.1 | Framework Node.js para aplicações server-side |
| **Prisma**     | ^6.9.0  | ORM moderno para Node.js e TypeScript         |
| **PostgreSQL** | 16      | Banco de dados relacional                     |
| **JWT**        | -       | Autenticação stateless via tokens             |
| **bcrypt**     | ^6.0.0  | Hash de senhas                                |
| **Jest**       | ^30.0.0 | Framework de testes                           |
| **TypeScript** | ^5.7.3  | Superset tipado de JavaScript                 |

---

## Estrutura do Projeto

```
src/
├── main.ts                    # Ponto de entrada da aplicação
├── app.module.ts              # Módulo raiz
├── app.controller.ts          # Controller principal
├── app.service.ts             # Service principal
└── modules/
    ├── auth/                  # Módulo de autenticação
    │   ├── decorators/        # @CurrentUser, @Public
    │   ├── dto/               # LoginDto, RegisterDto
    │   ├── guards/            # JwtAuthGuard
    │   ├── presentation/      # AuthController
    │   ├── services/          # AuthService
    │   └── strategies/        # JwtStrategy
    ├── prisma/                # Módulo do Prisma
    │   └── services/          # PrismaService
    ├── tasks/                 # Módulo de tarefas
    │   ├── dto/               # CreateTaskDto, UpdateTaskDto
    │   ├── entities/          # Task entity
    │   ├── presentation/      # TasksController
    │   ├── repositories/      # TaskRepository
    │   └── services/          # TasksService
    └── users/                 # Módulo de usuários
        ├── dto/               # CreateUserDto, UpdateUserDto
        ├── entities/          # User entity
        ├── presentation/      # UsersController
        ├── repositories/      # UserRepository
        └── services/          # UsersService
```

---

## Instalação

### Pré-requisitos

- Node.js (v18+)
- Yarn ou npm
- Docker (opcional, para PostgreSQL)

### Passo a passo

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd backend
```

2. **Instale as dependências**

```bash
yarn install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o banco de dados (Docker)**

```bash
docker-compose up -d
```

5. **Execute as migrations**

```bash
npx prisma migrate dev
```

6. **Gere o cliente Prisma**

```bash
yarn prisma:generate
```

7. **Inicie a aplicação**

```bash
# Desenvolvimento
yarn start:dev

# Produção
yarn build
yarn start:prod
```

A API estará disponível em `http://localhost:3000`

---

## Variáveis de Ambiente

| Variável       | Descrição                             | Exemplo                                                    |
| -------------- | ------------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL` | URL de conexão do PostgreSQL          | `postgresql://postgres:postgres@localhost:5432/desafio_db` |
| `JWT_SECRET`   | Chave secreta para assinar tokens JWT | `sua-chave-secreta-muito-segura`                           |
| `PORT`         | Porta da aplicação (opcional)         | `3000`                                                     |
| `NODE_ENV`     | Ambiente de execução                  | `development` \| `production`                              |

---

## Banco de Dados

### Schema

O banco de dados possui duas tabelas principais:

#### Tabela `usuarios`

| Campo       | Tipo     | Descrição                  |
| ----------- | -------- | -------------------------- |
| `id`        | UUID     | Identificador único        |
| `email`     | String   | Email único do usuário     |
| `name`      | String   | Nome do usuário            |
| `password`  | String   | Senha hasheada (bcrypt)    |
| `createdAt` | DateTime | Data de criação            |
| `updatedAt` | DateTime | Data da última atualização |

#### Tabela `tarefas`

| Campo         | Tipo      | Descrição                                     |
| ------------- | --------- | --------------------------------------------- |
| `id`          | UUID      | Identificador único                           |
| `title`       | String    | Título da tarefa                              |
| `description` | String    | Descrição da tarefa                           |
| `status`      | Enum      | Status: `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `createdAt`   | DateTime  | Data de criação                               |
| `updatedAt`   | DateTime  | Data da última atualização                    |
| `deletedAt`   | DateTime? | Data de exclusão (soft delete)                |
| `userId`      | UUID      | ID do usuário proprietário                    |

### Diagrama de Relacionamento

```
┌─────────────┐       ┌─────────────┐
│   usuarios  │       │   tarefas   │
├─────────────┤       ├─────────────┤
│ id (PK)     │──────<│ userId (FK) │
│ email       │       │ id (PK)     │
│ name        │       │ title       │
│ password    │       │ description │
│ createdAt   │       │ status      │
│ updatedAt   │       │ createdAt   │
└─────────────┘       │ updatedAt   │
                      │ deletedAt   │
                      └─────────────┘
```

---

## Endpoints da API

### Autenticação (`/auth`)

| Método | Endpoint         | Autenticação | Descrição                          |
| ------ | ---------------- | ------------ | ---------------------------------- |
| `POST` | `/auth/register` | ❌ Pública   | Registrar novo usuário             |
| `POST` | `/auth/login`    | ❌ Pública   | Fazer login                        |
| `GET`  | `/auth/me`       | ✅ JWT       | Obter dados do usuário autenticado |

#### POST /auth/register

Registra um novo usuário.

**Request Body:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (201):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@email.com",
    "name": "João Silva"
  }
}
```

**Erros:**

- `409 Conflict` - Email já está em uso

---

#### POST /auth/login

Autentica um usuário existente.

**Request Body:**

```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "email": "joao@email.com",
    "name": "João Silva"
  }
}
```

**Erros:**

- `401 Unauthorized` - Credenciais inválidas

---

#### GET /auth/me

Retorna os dados do usuário autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "uuid-do-usuario",
  "email": "joao@email.com",
  "name": "João Silva",
  "createdAt": "2026-01-07T12:00:00.000Z",
  "updatedAt": "2026-01-07T12:00:00.000Z"
}
```

---

### Tarefas (`/tasks`)

> ⚠️ Todos os endpoints de tarefas requerem autenticação JWT

| Método   | Endpoint             | Descrição                    |
| -------- | -------------------- | ---------------------------- |
| `POST`   | `/tasks`             | Criar nova tarefa            |
| `GET`    | `/tasks`             | Listar tarefas do usuário    |
| `GET`    | `/tasks/:id`         | Buscar tarefa por ID         |
| `PATCH`  | `/tasks/:id`         | Atualizar tarefa             |
| `DELETE` | `/tasks/:id`         | Deletar tarefa (soft delete) |
| `PATCH`  | `/tasks/:id/restore` | Restaurar tarefa deletada    |

#### POST /tasks

Cria uma nova tarefa para o usuário autenticado.

**Request Body:**

```json
{
  "title": "Estudar NestJS",
  "description": "Completar o módulo de autenticação",
  "status": "PENDING"
}
```

> O campo `status` é opcional e assume `PENDING` como padrão.

**Valores válidos para status:**

- `PENDING` - Pendente
- `IN_PROGRESS` - Em andamento
- `COMPLETED` - Concluída

**Response (201):**

```json
{
  "id": "uuid-da-tarefa",
  "title": "Estudar NestJS",
  "description": "Completar o módulo de autenticação",
  "status": "PENDING",
  "createdAt": "2026-01-07T12:00:00.000Z",
  "updatedAt": "2026-01-07T12:00:00.000Z",
  "deletedAt": null,
  "userId": "uuid-do-usuario"
}
```

---

#### GET /tasks

Lista todas as tarefas do usuário autenticado (exceto deletadas).

**Response (200):**

```json
[
  {
    "id": "uuid-da-tarefa",
    "title": "Estudar NestJS",
    "description": "Completar o módulo de autenticação",
    "status": "PENDING",
    "createdAt": "2026-01-07T12:00:00.000Z",
    "updatedAt": "2026-01-07T12:00:00.000Z",
    "deletedAt": null,
    "userId": "uuid-do-usuario"
  }
]
```

---

#### GET /tasks/:id

Busca uma tarefa específica por ID.

**Response (200):**

```json
{
  "id": "uuid-da-tarefa",
  "title": "Estudar NestJS",
  "description": "Completar o módulo de autenticação",
  "status": "PENDING",
  "createdAt": "2026-01-07T12:00:00.000Z",
  "updatedAt": "2026-01-07T12:00:00.000Z",
  "deletedAt": null,
  "userId": "uuid-do-usuario"
}
```

**Erros:**

- `404 Not Found` - Tarefa não encontrada

---

#### PATCH /tasks/:id

Atualiza uma tarefa existente.

**Request Body:** (todos os campos são opcionais)

```json
{
  "title": "Estudar NestJS - Avançado",
  "description": "Nova descrição",
  "status": "IN_PROGRESS"
}
```

**Response (200):**

```json
{
  "id": "uuid-da-tarefa",
  "title": "Estudar NestJS - Avançado",
  "description": "Nova descrição",
  "status": "IN_PROGRESS",
  "createdAt": "2026-01-07T12:00:00.000Z",
  "updatedAt": "2026-01-07T14:00:00.000Z",
  "deletedAt": null,
  "userId": "uuid-do-usuario"
}
```

**Erros:**

- `404 Not Found` - Tarefa não encontrada

---

#### DELETE /tasks/:id

Deleta uma tarefa (soft delete - marca `deletedAt`).

**Response (200):**

```json
{
  "id": "uuid-da-tarefa",
  "title": "Estudar NestJS",
  "description": "Completar o módulo de autenticação",
  "status": "PENDING",
  "createdAt": "2026-01-07T12:00:00.000Z",
  "updatedAt": "2026-01-07T14:00:00.000Z",
  "deletedAt": "2026-01-07T15:00:00.000Z",
  "userId": "uuid-do-usuario"
}
```

**Erros:**

- `404 Not Found` - Tarefa não encontrada

---

#### PATCH /tasks/:id/restore

Restaura uma tarefa previamente deletada.

**Response (200):**

```json
{
  "id": "uuid-da-tarefa",
  "title": "Estudar NestJS",
  "description": "Completar o módulo de autenticação",
  "status": "PENDING",
  "createdAt": "2026-01-07T12:00:00.000Z",
  "updatedAt": "2026-01-07T16:00:00.000Z",
  "deletedAt": null,
  "userId": "uuid-do-usuario"
}
```

**Erros:**

- `404 Not Found` - Tarefa não encontrada ou não está deletada

---

### Usuários (`/users`)

> ⚠️ Todos os endpoints de usuários requerem autenticação JWT

| Método   | Endpoint     | Descrição                |
| -------- | ------------ | ------------------------ |
| `POST`   | `/users`     | Criar usuário            |
| `GET`    | `/users`     | Listar todos os usuários |
| `GET`    | `/users/:id` | Buscar usuário por ID    |
| `PATCH`  | `/users/:id` | Atualizar usuário        |
| `DELETE` | `/users/:id` | Remover usuário          |

---

## Autenticação

A API utiliza **JWT (JSON Web Token)** para autenticação.

### Como funciona

1. O usuário faz login ou registro e recebe um `accessToken`
2. O token deve ser enviado no header `Authorization` de todas as requisições protegidas
3. Formato: `Authorization: Bearer <token>`

### Estrutura do Token

O payload do JWT contém:

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@email.com",
  "iat": 1704628800,
  "exp": 1704715200
}
```

### Rotas Públicas

As únicas rotas que não requerem autenticação são:

- `POST /auth/register`
- `POST /auth/login`

Todas as outras rotas são protegidas pelo `JwtAuthGuard` global.

---

## Testes

O projeto inclui testes unitários e E2E.

### Executar testes unitários

```bash
yarn test
```

### Executar testes com watch

```bash
yarn test:watch
```

### Executar testes com cobertura

```bash
yarn test:cov
```

### Executar testes E2E

```bash
yarn test:e2e
```

### Executar todos os testes

```bash
yarn test:all
```

---

## Deploy

### Render

O projeto está configurado para deploy no Render via `render.yaml`.

**Configuração:**

- Runtime: Node.js
- Build: `yarn install && yarn prisma:generate && yarn build`
- Start: `yarn start:prod`
- Região: Oregon

**Variáveis de ambiente necessárias no Render:**

- `DATABASE_URL` - URL do banco PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT

### Docker

Para desenvolvimento local com Docker:

```bash
# Subir apenas o banco de dados
docker-compose up -d

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

---

## Scripts Disponíveis

| Script                 | Descrição                                   |
| ---------------------- | ------------------------------------------- |
| `yarn start:dev`       | Inicia em modo desenvolvimento (hot-reload) |
| `yarn start:prod`      | Inicia em modo produção                     |
| `yarn build`           | Compila o projeto                           |
| `yarn test`            | Executa testes unitários                    |
| `yarn test:e2e`        | Executa testes E2E                          |
| `yarn test:cov`        | Executa testes com cobertura                |
| `yarn lint`            | Verifica e corrige linting                  |
| `yarn format`          | Formata o código                            |
| `yarn prisma:generate` | Gera o cliente Prisma                       |

---

## Códigos de Erro HTTP

| Código | Descrição                               |
| ------ | --------------------------------------- |
| `200`  | Sucesso                                 |
| `201`  | Criado com sucesso                      |
| `400`  | Requisição inválida (validação falhou)  |
| `401`  | Não autorizado (token inválido/ausente) |
| `404`  | Recurso não encontrado                  |
| `409`  | Conflito (ex: email já existe)          |
| `500`  | Erro interno do servidor                |

---

## Licença

Este projeto não possui licença pública (UNLICENSED).
