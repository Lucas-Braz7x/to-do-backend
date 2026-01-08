# Desafio Backend - API de Gerenciamento de Tarefas

API RESTful para gerenciamento de tarefas com autenticação JWT, construída com NestJS e Prisma.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Padrões de Projeto](#padrões-de-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
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
- ✅ Validação de dados com Zod
- ✅ Documentação Swagger/OpenAPI interativa
- ✅ Arquitetura modular com padrões de projeto (Repository, DI, DTO)
- ✅ Testes unitários e E2E
- ✅ Docker Compose para desenvolvimento
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
| **Swagger**    | ^11.2.4 | Documentação interativa da API (OpenAPI)      |

---

## Padrões de Projeto

Este projeto segue diversos padrões de projeto e boas práticas para garantir código limpo, testável e de fácil manutenção.

### 🏗️ Arquitetura Modular

O projeto utiliza a **arquitetura modular do NestJS**, onde cada domínio da aplicação (auth, tasks, users) é encapsulado em seu próprio módulo com responsabilidades bem definidas.

```
modules/
├── auth/           # Domínio de autenticação
├── tasks/          # Domínio de tarefas
├── users/          # Domínio de usuários
└── prisma/         # Infraestrutura de banco de dados
```

### 📐 Padrões Utilizados

| Padrão                         | Descrição                                                                          | Onde é usado                            |
| ------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------- |
| **Repository Pattern**         | Abstração da camada de acesso a dados, desacoplando a lógica de negócio do ORM     | `TaskRepository`, `UserRepository`      |
| **Dependency Injection**       | Inversão de controle para injeção de dependências, facilitando testes e manutenção | Todo o projeto via decorators do NestJS |
| **DTO (Data Transfer Object)** | Objetos para transferência de dados entre camadas, com validação                   | `CreateTaskDto`, `LoginDto`, etc.       |
| **Guard Pattern**              | Proteção de rotas com lógica de autorização encapsulada                            | `JwtAuthGuard`                          |
| **Strategy Pattern**           | Algoritmos de autenticação intercambiáveis                                         | `JwtStrategy` (Passport.js)             |
| **Decorator Pattern**          | Metadados e comportamentos adicionados via decorators                              | `@CurrentUser`, `@Public`               |
| **Soft Delete**                | Exclusão lógica preservando dados para auditoria/recuperação                       | Campo `deletedAt` em tarefas            |

### 🎯 Princípios SOLID

- **S** - Single Responsibility: Cada classe tem uma única responsabilidade (Service para lógica, Repository para dados, Controller para HTTP)
- **O** - Open/Closed: Módulos extensíveis via decorators e providers sem modificar código existente
- **L** - Liskov Substitution: DTOs e entities seguem contratos definidos
- **I** - Interface Segregation: Interfaces específicas para cada contexto
- **D** - Dependency Inversion: Dependências injetadas via construtor, facilitando mocks em testes

### 🔒 Segurança

| Prática                    | Implementação                                             |
| -------------------------- | --------------------------------------------------------- |
| **Hash de senhas**         | bcrypt com salt rounds                                    |
| **Autenticação stateless** | JWT com expiração configurável                            |
| **Validação de entrada**   | Zod schemas com mensagens de erro customizadas            |
| **CORS configurável**      | Origens permitidas via variável de ambiente               |
| **Guard global**           | Todas as rotas protegidas por padrão (exceto `@Public()`) |

### 📁 Convenções de Nomenclatura

```
src/modules/<domínio>/
├── dto/              # Data Transfer Objects (create-*.dto.ts, update-*.dto.ts)
├── entities/         # Entidades de domínio (*.entity.ts)
├── presentation/     # Controllers (*.controller.ts)
├── repositories/     # Repositórios (*.repository.ts)
├── services/         # Lógica de negócio (*.service.ts)
├── guards/           # Guards de autorização (*.guard.ts)
├── decorators/       # Decorators customizados (*.decorator.ts)
└── strategies/       # Estratégias de autenticação (*.strategy.ts)
```

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
| `CORS_ORIGIN`  | Origens permitidas para CORS          | `*` ou `https://meusite.com`                               |

---

## Documentação da API (Swagger)

A API possui documentação interativa gerada automaticamente com **Swagger/OpenAPI**.

### 📍 Acessando a Documentação

Após iniciar a aplicação, acesse:

```
http://localhost:3000/api/docs
```

### 🐳 Com Docker

Se estiver usando Docker Compose, a documentação estará disponível na mesma URL:

```bash
# Inicie os containers
docker-compose up -d

# Acesse a documentação
http://localhost:3000/api/docs
```

### 🔐 Autenticação no Swagger

Para testar endpoints protegidos diretamente no Swagger:

1. Execute o login via `POST /auth/login` ou registre-se via `POST /auth/register`
2. Copie o `accessToken` retornado
3. Clique no botão **"Authorize"** (🔓) no topo da página
4. Cole o token no campo (sem o prefixo "Bearer")
5. Clique em **"Authorize"** e depois **"Close"**

Agora você pode testar todos os endpoints autenticados!

### 📋 Recursos da Documentação

| Recurso        | Descrição                                     |
| -------------- | --------------------------------------------- |
| **Schemas**    | Visualização dos DTOs com exemplos de valores |
| **Try it out** | Teste endpoints diretamente no navegador      |
| **Responses**  | Exemplos de respostas para cada código HTTP   |
| **Models**     | Definição completa das entidades              |

### 🏷️ Tags Organizacionais

A API está organizada em tags para facilitar a navegação:

- **auth** - Endpoints de autenticação (register, login, me)
- **tasks** - Gerenciamento de tarefas (CRUD + restore)
- **users** - Gerenciamento de usuários

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

O projeto inclui configuração completa para Docker com hot-reload em desenvolvimento.

#### Ambiente completo (API + PostgreSQL)

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs da API
docker-compose logs -f api

# Reconstruir após mudanças no package.json
docker-compose build --no-cache api && docker-compose up -d api
```

#### Apenas banco de dados

```bash
# Subir apenas o PostgreSQL
docker-compose up -d postgres
```

#### Comandos úteis

```bash
# Parar containers
docker-compose down

# Parar e remover volumes (apaga dados do banco)
docker-compose down -v

# Ver status dos containers
docker-compose ps
```

#### Acessos disponíveis

| Serviço        | URL                            |
| -------------- | ------------------------------ |
| **API**        | http://localhost:3000          |
| **Swagger**    | http://localhost:3000/api/docs |
| **PostgreSQL** | localhost:5432                 |

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
