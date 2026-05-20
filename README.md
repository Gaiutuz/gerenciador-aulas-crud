# Sistema de Gerenciamento de Planos de Aula

Aplicação full stack para criação, organização e consulta de planos de aula, com **Smart Assist** — um assistente pedagógico alimentado por IA (OpenAI GPT-4o-mini) que sugere conteúdos, tópicos e tags automaticamente.

<img width="1916" height="958" alt="tela-crud" src="https://github.com/user-attachments/assets/3ba43abe-5f2f-4673-b886-5099a7df9715" />

---

## Funcionalidades

- **CRUD completo** de planos de aula com paginação
- **Smart Assist (IA)**: geração automática de conteúdos, recursos de apoio e tags via GPT-4o-mini
- **Filtros** por disciplina, tag e intervalo de datas
- **Busca** por título
- **Ordenação** por título ou data de cadastro
- **Logs estruturados** (JSON) com métricas de uso da IA (tokens, latência)
- **Health check** em `/health`
- **CI/CD** com GitHub Actions (flake8, black, ESLint, build)
- **Docker** — sobe tudo com um único comando

---

## Stack Tecnológica

| Camada     | Tecnologia                                |
|------------|-------------------------------------------|
| Backend    | Python 3.12 + Flask 3 + Flask-SQLAlchemy  |
| Banco      | PostgreSQL 16                             |
| IA         | OpenAI API (GPT-4o-mini) via `openai` SDK |
| Validação  | Marshmallow                               |
| Logs       | structlog (JSON estruturado)              |
| Frontend   | React 18 + Vite 5 + React Router v6       |
| UI/Design  | CSS puro (design system próprio, DM Serif Display + DM Sans) |
| Container  | Docker + Docker Compose                   |
| CI         | GitHub Actions                            |
| Proxy      | Nginx (produção)                          |

---

## Execução Local com Docker

### Pré-requisitos

- Docker ≥ 24
- Docker Compose v2

### 1. Clone e configure o ambiente

```bash
git clone <seu-repositorio>
cd lesson-planner

cp backend/.env.example backend/.env
# Edite backend/.env e insira sua OPENAI_API_KEY
```

### 2. Suba a aplicação (produção)

```bash
docker compose up --build
```

A aplicação estará disponível em **http://localhost:3000**.

### 3. Suba em modo de desenvolvimento (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend (Vite HMR): **http://localhost:5173**
- Backend (Flask debug): **http://localhost:5000**

---

## Variáveis de Ambiente

Crie `backend/.env` com base em `backend/.env.example`:

```env
FLASK_ENV=development
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=postgresql://postgres:postgres@db:5432/lessonplanner
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

>  **Nunca comite o arquivo `.env`**. Ele está no `.gitignore`.

---

## 🔌 API Endpoints

| Método   | Rota                                    | Descrição                           |
|----------|-----------------------------------------|-------------------------------------|
| `GET`    | `/health`                               | Health check (status + banco)       |
| `GET`    | `/api/lesson-plans/`                    | Listar planos (filtros + paginação) |
| `GET`    | `/api/lesson-plans/:id`                 | Buscar plano por ID                 |
| `POST`   | `/api/lesson-plans/`                    | Criar plano                         |
| `PUT`    | `/api/lesson-plans/:id`                 | Atualizar plano                     |
| `DELETE` | `/api/lesson-plans/:id`                 | Excluir plano                       |
| `POST`   | `/api/lesson-plans/smart-assist`        | Gerar recomendações com IA          |
| `GET`    | `/api/lesson-plans/meta/disciplines`    | Listar disciplinas únicas           |
| `GET`    | `/api/lesson-plans/meta/tags`           | Listar tags únicas                  |

### Parâmetros de listagem (`GET /api/lesson-plans/`)

| Parâmetro    | Tipo   | Descrição                          |
|--------------|--------|------------------------------------|
| `page`       | int    | Página atual (default: 1)          |
| `per_page`   | int    | Itens por página (max: 50)         |
| `search`     | string | Busca por título                   |
| `discipline` | string | Filtro por disciplina              |
| `tag`        | string | Filtro por tag                     |
| `date_from`  | date   | Data prevista mínima (YYYY-MM-DD)  |
| `date_to`    | date   | Data prevista máxima               |
| `sort_by`    | string | `title` ou `created_at`            |
| `order`      | string | `asc` ou `desc`                    |

---

##  Smart Assist — Prompt Engineering

O backend envia ao GPT-4o-mini um **system prompt** que o instrui a agir como "Assistente Pedagógico". O modelo retorna obrigatoriamente JSON no formato:

```json
{
  "contents": "Tópicos e conteúdos complementares...",
  "support_resources": "Livros, sites, ferramentas recomendados...",
  "tags": ["tag1", "tag2", "tag3"]
}
```

O uso de `response_format: { type: "json_object" }` garante que a resposta seja sempre JSON válido.

---

##  Observabilidade

Todos os logs são emitidos em **JSON estruturado** via `structlog`. Exemplo de log de interação com a IA:

```json
{
  "event": "AI Request completed",
  "title": "Introdução ao OSPF",
  "discipline": "Redes",
  "model": "gpt-4o-mini",
  "token_usage": 412,
  "prompt_tokens": 180,
  "completion_tokens": 232,
  "latency_seconds": 1.4,
  "timestamp": "2024-07-01T14:32:01Z",
  "level": "info"
}
```

---

##  CI/CD (GitHub Actions)

O pipeline roda a cada `push` e `pull_request`:

1. **backend-lint**: `flake8` + `black --check`
2. **frontend-lint**: `eslint`
3. **frontend-build**: `vite build`

---

##  Estrutura do Projeto

```
lesson-planner/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Application factory
│   │   ├── config.py           # Configurações por ambiente
│   │   ├── schemas.py          # Validação Marshmallow
│   │   ├── models/
│   │   │   └── lesson_plan.py  # Modelo SQLAlchemy
│   │   ├── routes/
│   │   │   ├── lesson_plans.py # CRUD + Smart Assist
│   │   │   └── health.py       # Health check
│   │   └── services/
│   │       └── ai_service.py   # Integração OpenAI
│   ├── migrations/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── run.py                  # Dev entrypoint
│   └── wsgi.py                 # Prod entrypoint (gunicorn)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LessonPlanCard.jsx
│   │   │   ├── LessonPlanForm.jsx  # Formulário + Smart Assist
│   │   │   ├── LessonPlanDetail.jsx
│   │   │   ├── DeleteConfirm.jsx
│   │   │   └── Pagination.jsx
│   │   ├── hooks/
│   │   │   └── useToast.jsx
│   │   ├── pages/
│   │   │   └── ListPage.jsx    # Listagem com filtros
│   │   ├── services/
│   │   │   └── api.js          # Axios client
│   │   └── styles/
│   │       └── global.css      # Design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── .github/workflows/ci.yml
├── docker-compose.yml          # Produção
├── docker-compose.dev.yml      # Desenvolvimento
└── README.md
```

---

##  Decisões de Design

- **Tipografia**: DM Serif Display (títulos) + DM Sans (corpo) — sofisticado e legível
- **Paleta**: Tons de pergaminho, tinta escura e dourado — remete ao universo editorial/acadêmico
- **SPA com React + Vite**: carregamento rápido, HMR no dev, build otimizado
- **CSS puro**: design system coeso sem dependência de UI libraries externas
- **Modais em vez de rotas**: UX fluida sem perder contexto da listagem

---

##  Licença

MIT © 2024
