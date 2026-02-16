## 1) README.md (полный текст)

````md
# Online Library — Docker stack + Telegram Bot + Telegram Mini App

Репозиторий содержит:
- **Backend API**: FastAPI + async SQLAlchemy + Alembic + PostgreSQL
- **Telegram Bot**: aiogram 3
- **Telegram Mini App**: Vite + React + TypeScript
- **Инфраструктура**: Docker Compose (DB, API, pgAdmin, DB_test, Bot)

✅ **Официальный режим запуска проекта (как у нас):**
- **всё серверное** (API + DB + pgAdmin + DB_test + Bot) — **в Docker**
- **miniapp** — **локально** (Vite dev server)

---

## Содержание
- [0. Требования](#0-требования)
- [1. Запуск всего стека в Docker](#1-запуск-всего-стека-в-docker)
- [2. Миграции Alembic](#2-миграции-alembic)
- [3. Запуск API локально из PyCharm (опционально)](#3-запуск-api-локально-из-pycharm-опционально)
- [4. Создать пользователя и выдать admin через CLI](#4-создать-пользователя-и-выдать-admin-через-cli)
- [5. Прогон pytest](#5-прогон-pytest)
- [6. Проверка export.csv](#6-проверка-exportcsv)
- [7. Запуск Telegram Bot](#7-запуск-telegram-bot)
- [8. Запуск Mini App](#8-запуск-mini-app)
- [9. Troubleshooting](#9-troubleshooting)

---

## 0. Требования

- Docker Desktop
- Python 3.11 (для локального запуска/pytest/CLI из PyCharm)
- Node.js + npm (для miniapp)

---

## 1. Запуск всего стека в Docker

### 1.1 Поднять стек (DB + API + pgAdmin + DB_test + Bot)
Из корня репозитория:

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml up -d --build
````

Проверки:

* Swagger /docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* pgAdmin: [http://127.0.0.1:5050](http://127.0.0.1:5050)

Логи:

```powershell
docker compose -f .\infra\docker-compose.stack.yml logs -f api
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

Остановить стек:

```powershell
docker compose -f .\infra\docker-compose.stack.yml down
```

---

## 2. Миграции Alembic

### 2.1 Применить миграции вручную в Docker

Если API контейнер поднят:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic upgrade head
```

### 2.2 Создать новую миграцию (пример)

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic revision --autogenerate -m "my_migration"
```

> Примечание: если в `docker-compose.stack.yml` миграции запускаются автоматически при старте API, то ручной шаг не обязателен.
> Но команда выше — “железный” способ убедиться, что база на актуальной версии.

---

## 3. Запуск API локально из PyCharm (опционально)

Этот режим нужен, если хочешь дебажить API в PyCharm, при этом DB остаётся в Docker.

### Вариант A (рекомендую): остановить только контейнер API и запустить локально на 8000

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml stop api
```

Теперь локально из PyCharm запускай `uvicorn` на **8000**.

### Вариант B: оставить контейнер API и запустить локально на 8001

Локальный запуск:

* порт `8001`
* miniapp/.env временно укажи `http://127.0.0.1:8001/api/v1`

---

### 3.1 Переменные окружения для локального API

При локальном запуске (API на хосте), Postgres остаётся в Docker на порту 5432, поэтому `DATABASE_URL` должен указывать на `127.0.0.1`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/online_library
JWT_SECRET=CHANGE_ME_SUPER_SECRET
JWT_ALG=HS256
JWT_EXPIRES_MIN=60
```

> В Docker-режиме `DATABASE_URL` обычно указывает на `db:5432`. Для локального режима нужен `127.0.0.1:5432`.
> Удобно иметь два env-файла: `.env.docker` и `.env.local`.

---

## 4. Создать пользователя и выдать admin через CLI

### 4.1 Создать пользователя

Создание пользователя делается через API (это “официальный” путь):

* через Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
  Endpoint: `POST /api/v1/auth/register`
* или через Mini App (страница Register)

### 4.2 Выдать роль admin через CLI (реально в проекте есть команда)

CLI находится в backend: `python -m app.cli`

Команда смены роли:

* роли: `admin` или `client`
* параметр: email

#### В Docker:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api python -m app.cli set-role --email admin@example.com --role admin
```

#### Локально (если запускаешь backend в venv):

```powershell
cd A:\online-library\backend\src
python -m app.cli set-role --email admin@example.com --role admin
```

---

## 5. Прогон pytest

Тесты используют отдельную тестовую БД на `localhost:5433` (контейнер `db_test`).

### 5.1 Поднять тестовую БД

Если поднимаешь весь стек — она уже есть. Если нужно отдельно:

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml up -d db_test
```

### 5.2 Запустить тесты (локально)

```powershell
cd A:\online-library\backend
pytest -q
```

Опционально можно переопределить URL тестовой БД:

```powershell
$env:TEST_DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/online_library_test"
pytest -q
```

> В conftest тесты сами прогоняют миграции на test DB перед запуском.

---

## 6. Проверка export.csv

Экспорт CSV доступен только админу:
`GET /api/v1/admin/books/export.csv`

### 6.1 Получить JWT токен

1. Зарегистрируй пользователя (`/auth/register`)
2. Сделай его admin через CLI (см. раздел 4.2)
3. Логин (`/auth/login`) → получи `access_token`

### 6.2 Скачать CSV через curl (Windows)

```powershell
curl.exe -L -o books.csv -H "Authorization: Bearer <JWT_TOKEN>" `
  "http://127.0.0.1:8000/api/v1/admin/books/export.csv"
```

Проверка файла:

```powershell
type .\books.csv
```

Ожидаемые признаки:

* Content-Type: `text/csv`
* Content-Disposition: `attachment; filename="books.csv"`
* Заголовки CSV: `id,title,year,isbn,authors,genres`

---

## 7. Запуск Telegram Bot

### 7.1 В Docker (официальный режим)

1. Заполни `bot/.env`:

```env
BOT_TOKEN=PASTE_YOUR_TOKEN_HERE
# Опционально: ссылка miniapp (нужна для кнопки WEB), должна быть https
MINIAPP_URL=https://YOUR_HTTPS_MINIAPP_URL
```

2. Перезапусти бота:

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml restart bot
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

> В Docker бот обращается к API по внутреннему адресу (обычно задано в compose):
> `http://api:8000/api/v1`

---

## 8. Запуск Mini App

Mini App запускается локально.

### 8.1 Установка и запуск

```powershell
cd A:\online-library\miniapp
npm install
npm run dev
```

Открыть:

* [http://localhost:5173/](http://localhost:5173/)

### 8.2 Настройка API baseURL

`miniapp/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### 8.3 Важно про CORS

Если при логине/регистрации в miniapp появляется `Failed to fetch`, проверь, что в API включён CORS для:

* `http://localhost:5173`
* `http://127.0.0.1:5173`

---

## 9. Troubleshooting

### 9.1 Alembic: миграции не применяются / “can't locate revision”

* Запусти миграции вручную:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic upgrade head
```

* Проверь, что `alembic.ini` и `alembic/` доступны контейнеру (volumes).

### 9.2 CORS / OPTIONS 405 / Failed to fetch (miniapp)

Симптомы:

* в логах API: `OPTIONS /auth/login 405`
* в браузере: `Failed to fetch`

Решение:

* Включить `CORSMiddleware` и разрешить origin `localhost:5173`.

### 9.3 Порты заняты (5173 / 8000 / 5432 / 5050 / 5433)

Проверить порт 5173:

```powershell
netstat -ano | findstr :5173
tasklist /FI "PID eq <PID>"
taskkill /PID <PID> /F
```

Запустить miniapp на другом порту:

```powershell
npm run dev -- --port 5174
```

### 9.4 Ошибки env (pydantic-settings / validation / extra_forbidden)

* Проверь `.env` файлы и названия переменных.
* Рекомендуется, чтобы Settings имел `extra="ignore"` (чтобы новые env не ломали запуск).
* При запуске в Docker проверь, что `DATABASE_URL` указывает на `db:5432`, а локально — на `127.0.0.1:5432`.

### 9.5 База недоступна / API не стартует

Проверь состояние:

```powershell
docker compose -f .\infra\docker-compose.stack.yml ps
docker compose -f .\infra\docker-compose.stack.yml logs -f db
docker compose -f .\infra\docker-compose.stack.yml logs -f api
```

### 9.6 Docker build: “parent snapshot … does not exist”

Это повреждённый build cache.

```powershell
docker buildx prune -a -f
docker builder prune -a -f
```

Перезапусти Docker Desktop и пересобери:

```powershell
docker compose -f .\infra\docker-compose.stack.yml build --no-cache
```

---

## Полезные команды

Полный рестарт стека:

```powershell
docker compose -f .\infra\docker-compose.stack.yml down
docker compose -f .\infra\docker-compose.stack.yml up -d --build
```

Зайти в контейнер API:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api sh
```

```

---

## 2) Run Configurations для PyCharm, которые стоит сохранить

1) **Docker Compose — Up (stack)**
- Type: Docker Compose
- Compose file: `A:\online-library\infra\docker-compose.stack.yml`
- Command: `up -d --build`

2) **Docker Compose — Down (stack)**
- Type: Docker Compose
- Compose file: `A:\online-library\infra\docker-compose.stack.yml`
- Command: `down`

3) **API (Local) — Uvicorn**
- Type: Python
- Module: `uvicorn`
- Parameters: `app.main:app --reload --host 127.0.0.1 --port 8000` *(или 8001, если контейнер API не остановлен)*
- Working directory: `A:\online-library\backend\src`
- Env file: `A:\online-library\backend\.env` *(или `.env.local`)*

4) **Alembic upgrade head (Local)**
- Type: Python
- Module: `alembic`
- Parameters: `upgrade head`
- Working directory: `A:\online-library\backend`
- Env file: `A:\online-library\backend\.env`

5) **CLI — set-role (Local)**
- Type: Python
- Script/Module: `app.cli`
- Parameters: `set-role --email admin@example.com --role admin`
- Working directory: `A:\online-library\backend\src`
- Env file: `A:\online-library\backend\.env`

6) **Pytest (backend)**
- Type: Python tests → pytest
- Target: `A:\online-library\backend`
- Additional args: `-q`
- Env vars (опционально): `TEST_DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/online_library_test`

7) **Bot (Local, optional)**
- Type: Python
- Module: `bot_app`
- Working directory: `A:\online-library\bot\src`
- Env file: `A:\online-library\bot\.env`

8) **Miniapp — npm dev**
- Type: npm
- package.json: `A:\online-library\miniapp\package.json`
- Script: `dev`
- (optional) Node parameters / args: `-- --port 5173`
```
