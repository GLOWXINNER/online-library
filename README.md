```md
# Online Library
**Client–server system:** FastAPI API + PostgreSQL + Telegram Bot (aiogram 3) + Telegram Mini App (Vite/React/TS)

✅ **Official run mode (this repository):**
- **Docker:** API + DB + pgAdmin + DB_test + Telegram Bot  
- **Local:** Mini App (Vite dev server)

---

## Contents
- [Requirements](#requirements)
- [Project structure](#project-structure)
- [Run everything (Docker)](#run-everything-docker)
- [Migrations (Alembic)](#migrations-alembic)
- [Run API locally from PyCharm (optional)](#run-api-locally-from-pycharm-optional)
- [Create user and make admin (CLI)](#create-user-and-make-admin-cli)
- [Run tests (pytest)](#run-tests-pytest)
- [Check export.csv](#check-exportcsv)
- [Run Telegram Bot](#run-telegram-bot)
- [Run Mini App (local)](#run-mini-app-local)
- [Troubleshooting](#troubleshooting)

---

## Requirements
- Docker Desktop
- Python **3.11** (for local run/debug, CLI, pytest)
- Node.js + npm (for Mini App)

---

## Project structure
```

backend/         # FastAPI app + Alembic migrations
bot/             # aiogram 3 bot
miniapp/         # Vite + React + TS mini app
infra/           # docker-compose files

````

---

## Run everything (Docker)

### Start stack (DB + API + pgAdmin + DB_test + Bot)
From repository root:

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml up -d --build
````

### Check services

* API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* pgAdmin: [http://127.0.0.1:5050](http://127.0.0.1:5050)

### Logs

```powershell
docker compose -f .\infra\docker-compose.stack.yml logs -f api
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

### Stop stack

```powershell
docker compose -f .\infra\docker-compose.stack.yml down
```

---

## Migrations (Alembic)

### Apply migrations in Docker

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic upgrade head
```

### Create migration (autogenerate)

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic revision --autogenerate -m "my_migration"
```

> Note: In our stack migrations may run automatically on API start (depends on `command` in compose).
> The command above is the reliable “manual” way.

---

## Run API locally from PyCharm (optional)

This is useful for debugging in PyCharm while DB is still in Docker.

### Option A (recommended): stop API container, run local API on port 8000

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml stop api
```

Run local uvicorn in PyCharm (see Run Configurations below).

### Local env

When API runs on host, it must connect to DB through `127.0.0.1:5432`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/online_library
JWT_SECRET=CHANGE_ME_SUPER_SECRET
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> In Docker mode, DB host is `db:5432`.
> In local mode, DB host is `127.0.0.1:5432`.

---

## Create user and make admin (CLI)

### Create user

Official way is via API:

* Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
  `POST /api/v1/auth/register`
* or via Mini App (Register screen)

### Make user admin (CLI)

CLI module: `python -m app.cli`

#### In Docker

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api `
  python -m app.cli set-role --email admin@example.com --role admin
```

#### Local

```powershell
cd A:\online-library\backend\src
python -m app.cli set-role --email admin@example.com --role admin
```

---

## Run tests (pytest)

Tests use a dedicated test DB (`db_test`) on **localhost:5433**.

### Ensure test DB is running

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml up -d db_test
```

### Run pytest locally

```powershell
cd A:\online-library\backend
pytest -q
```

Optional override (if supported in your tests):

```powershell
$env:TEST_DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/online_library_test"
pytest -q
```

---

## Check export.csv

Export is admin-only:
`GET /api/v1/admin/books/export.csv`

### Steps

1. Register user (`/auth/register`)
2. Make admin via CLI (`set-role ... admin`)
3. Login (`/auth/login`) → get `access_token`
4. Download CSV:

```powershell
curl.exe -L -o books.csv `
  -H "Authorization: Bearer <JWT_TOKEN>" `
  "http://127.0.0.1:8000/api/v1/admin/books/export.csv"
```

Check file:

```powershell
type .\books.csv
```

---

## Run Telegram Bot

### Docker (official mode)

1. Fill `bot/.env`:

```env
BOT_TOKEN=PASTE_YOUR_TOKEN_HERE
MINIAPP_URL=https://YOUR_HTTPS_MINIAPP_URL
```

2. Restart bot:

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml restart bot
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

> Inside Docker, bot uses internal API URL (configured in compose):
> `http://api:8000/api/v1`

---

## Run Mini App (local)

### Install and start

```powershell
cd A:\online-library\miniapp
npm install
npm run dev
```

Open:

* [http://localhost:5173/](http://localhost:5173/)

### Configure API base URL

`miniapp/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### HTTPS for Telegram Mini App

Telegram requires **HTTPS** URL for WebApp in production.
For development use a tunnel (cloudflared/ngrok) to get `https://...` and set it to `MINIAPP_URL`.

---

## Troubleshooting

### Alembic / migrations issues

Apply manually:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic upgrade head
```

### CORS / OPTIONS 405 / “Failed to fetch” in Mini App

Symptoms:

* API logs: `OPTIONS /auth/login 405`
* Browser: `Failed to fetch`

Fix:

* Enable `CORSMiddleware` in API and allow origins:

  * `http://localhost:5173`
  * `http://127.0.0.1:5173`
* Restart API container.

### Port is already in use (5173 / 8000 / 5432 / 5050 / 5433)

Find process on port 5173:

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Run Mini App on another port:

```powershell
npm run dev -- --port 5174
```

### Env / pydantic-settings validation errors

* Check variable names in `.env`
* Recommended: `extra="ignore"` in Settings
* Remember: Docker DB host is `db`, local host is `127.0.0.1`

### Docker build error: “parent snapshot … does not exist”

Clear build cache:

```powershell
docker buildx prune -a -f
docker builder prune -a -f
```

Restart Docker Desktop and rebuild:

```powershell
docker compose -f .\infra\docker-compose.stack.yml build --no-cache
```

---

## Recommended PyCharm Run Configurations

1. **Docker Compose: Up (stack)**

* Compose file: `infra/docker-compose.stack.yml`
* Command: `up -d --build`

2. **Docker Compose: Down (stack)**

* Compose file: `infra/docker-compose.stack.yml`
* Command: `down`

3. **API (local) — Uvicorn**

* Module: `uvicorn`
* Params: `app.main:app --reload --host 127.0.0.1 --port 8000`
* Working dir: `backend/src`
* Env file: `backend/.env` (or `.env.local`)

4. **Alembic upgrade head (local)**

* Module: `alembic`
* Params: `upgrade head`
* Working dir: `backend`
* Env file: `backend/.env`

5. **CLI set-role admin (local)**

* Module: `app.cli`
* Params: `set-role --email admin@example.com --role admin`
* Working dir: `backend/src`
* Env file: `backend/.env`

6. **Pytest (backend)**

* Target: `backend`
* Args: `-q`
* Optional env: `TEST_DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/online_library_test`

7. **Mini App (npm dev)**

* `miniapp/package.json` → script `dev`

8. **Bot (local, optional)**

* Module: `bot_app`
* Working dir: `bot/src`
* Env file: `bot/.env`

```
::contentReference[oaicite:0]{index=0}
```
