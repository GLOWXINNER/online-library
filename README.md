## 1) README.md (полный текст)

````md
# Online Library — API + Telegram Bot + Telegram Mini App

Монорепозиторий онлайн-библиотеки:
- **Backend API**: FastAPI + async SQLAlchemy + Alembic + PostgreSQL
- **Telegram Bot**: aiogram 3
- **Telegram Mini App**: Vite + React + TypeScript
- **Инфраструктура**: Docker Compose (DB, API, pgAdmin, тестовая DB)

> Примеры команд ниже рассчитаны на Windows PowerShell и путь `A:\online-library`.
> При необходимости адаптируй под свою ОС.

---

## Содержание
- [1. Быстрый старт (Docker)](#1-быстрый-старт-docker)
- [2. Миграции Alembic](#2-миграции-alembic)
- [3. Запуск API локально из PyCharm](#3-запуск-api-локально-из-pycharm)
- [4. Создание пользователя и выдача admin через CLI](#4-создание-пользователя-и-выдача-admin-через-cli)
- [5. Тесты pytest](#5-тесты-pytest)
- [6. Проверка export.csv](#6-проверка-exportcsv)
- [7. Запуск Telegram Bot](#7-запуск-telegram-bot)
- [8. Запуск Mini App](#8-запуск-mini-app)
- [9. Troubleshooting](#9-troubleshooting)

---

## 1. Быстрый старт (Docker)

### Требования
- Docker Desktop
- Python 3.11 (для локального запуска/тестов)
- Node.js (для miniapp)

### Поднять стек в Docker (DB + API + pgAdmin + DB_test + Bot)
Из корня репозитория:

```powershell
cd A:\online-library
docker compose -f .\infra\docker-compose.stack.yml up -d --build
````

Проверки:

* API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* pgAdmin: [http://127.0.0.1:5050](http://127.0.0.1:5050)

Посмотреть логи:

```powershell
docker compose -f .\infra\docker-compose.stack.yml logs -f api
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

Остановить:

```powershell
docker compose -f .\infra\docker-compose.stack.yml down
```

---

## 2. Миграции Alembic

### Применить миграции в Docker

Если API контейнер уже поднят:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic upgrade head
```

### Создать новую миграцию (пример)

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic revision --autogenerate -m "add_field_x"
```

> В нашем docker-compose миграции могут выполняться автоматически при старте API (если это задано в `command`).

---

## 3. Запуск API локально из PyCharm

### 3.1 Подготовка окружения

1. Открыть проект `A:\online-library` в PyCharm
2. Создать/выбрать интерпретатор Python 3.11 (venv)
3. Установить зависимости backend (выбери свой способ):

* если `requirements.txt`:

```powershell
cd A:\online-library\backend
pip install -r requirements.txt
```

* если Poetry — установить через Poetry и выполнить `poetry install`

### 3.2 Переменные окружения

Создай `backend/.env` (или настрой EnvFile в Run Configuration). Минимально нужно:

* `DATABASE_URL` (локально может быть `localhost:5432`, в docker — `db:5432`)
* `JWT_SECRET` и др.

Пример:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/online_library
JWT_SECRET=CHANGE_ME
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 3.3 Запуск uvicorn из PyCharm

Запускай модуль/скрипт (пример):

* Module: `uvicorn`
* Parameters:

  * `app.main:app --reload --host 127.0.0.1 --port 8000`
* Working directory: `A:\online-library\backend\src`
* Env file: `backend/.env`

Проверка:

* [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 4. Создание пользователя и выдача admin через CLI

> Реализация команды зависит от проекта. Ниже — рекомендуемый интерфейс CLI.
> Если в проекте уже есть `python -m app.cli ...` — используй его.

### 4.1 Создать пользователя

**В Docker:**

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api python -m app.cli create-user --email user@example.com --password 123456
```

**Локально:**

```powershell
cd A:\online-library\backend\src
python -m app.cli create-user --email user@example.com --password 123456
```

### 4.2 Сделать пользователя admin

**В Docker:**

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api python -m app.cli make-admin --email user@example.com
```

**Локально:**

```powershell
cd A:\online-library\backend\src
python -m app.cli make-admin --email user@example.com
```

---

## 5. Тесты pytest

### 5.1 Поднять тестовую БД

В docker-compose у нас есть `db_test` на `localhost:5433`.

Убедись, что она запущена:

```powershell
docker compose -f .\infra\docker-compose.stack.yml up -d db_test
```

### 5.2 Запуск тестов локально

```powershell
cd A:\online-library\backend
pytest -q
```

Если в тестах используется переменная `DATABASE_URL_TEST`, задай её:

```env
DATABASE_URL_TEST=postgresql+asyncpg://postgres:postgres@localhost:5433/online_library_test
```

---

## 6. Проверка export.csv

В админ-панели бота/API есть экспорт CSV (например, список книг).

### 6.1 Запуск экспорта

Варианты:

* Через бот (кнопка/команда Admin → Export CSV)
* Через API endpoint (если реализован): `/api/v1/admin/export`

### 6.2 Где искать файл

Типовой вариант:

* Файл сохраняется внутри контейнера API/бота (путь зависит от реализации)
* Либо возвращается как **download response** (в браузере скачивается сразу)

Если файл сохраняется внутри контейнера, можно вытащить:

```powershell
docker cp online_library_api:/app/export.csv .\export.csv
```

Проверка содержимого:

```powershell
type .\export.csv
```

---

## 7. Запуск Telegram Bot

### 7.1 В Docker (рекомендуется в нашем стеке)

1. Укажи в `bot/.env`:

```env
BOT_TOKEN=YOUR_TOKEN
MINIAPP_URL=https://YOUR_HTTPS_MINIAPP_URL
```

2. Перезапусти бота:

```powershell
docker compose -f .\infra\docker-compose.stack.yml restart bot
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

> Внутри Docker бот обращается к API по `http://api:8000/api/v1` (это настроено в compose).

### 7.2 Локально (альтернатива)

```powershell
cd A:\online-library\bot
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m bot_app
```

---

## 8. Запуск Mini App

### 8.1 Установка и запуск

```powershell
cd A:\online-library\miniapp
npm install
npm run dev
```

По умолчанию:

* [http://localhost:5173/#/books](http://localhost:5173/#/books)

### 8.2 Настройка API baseURL

`miniapp/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### 8.3 HTTPS для Telegram Mini App

Telegram в проде требует **HTTPS** URL для Mini App.

Самый простой вариант для dev — поднять туннель на локальный Vite:

* cloudflared / ngrok → получить `https://...` → поставить в `MINIAPP_URL` у бота и/или в BotFather.

---

## 9. Troubleshooting

### 9.1 Alembic: "can't locate revision", миграции не применяются

* Проверь, что `alembic.ini` и `alembic/` попадают в контейнер и путь верный.
* Выполни миграции вручную:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api alembic upgrade head
```

* Если после git pull миграций стало больше — пересобери API:

```powershell
docker compose -f .\infra\docker-compose.stack.yml up -d --build api
```

### 9.2 CORS / OPTIONS 405 / "Failed to fetch" в miniapp

* Это означает, что браузер делает preflight OPTIONS, а сервер не отвечает корректно.
* Включи `CORSMiddleware` в FastAPI и добавь origin:

  * `http://localhost:5173`
  * `http://127.0.0.1:5173`
* Перезапусти API контейнер.

### 9.3 Порты заняты (5173 / 8000 / 5432 / 5050)

Проверить кто занял порт:

```powershell
netstat -ano | findstr :5173
tasklist /FI "PID eq 12345"
taskkill /PID 12345 /F
```

Или запусти Vite на другом порту:

```powershell
npm run dev -- --port 5174
```

### 9.4 Ошибки env / pydantic-settings (extra_forbidden / parse errors)

* Убедись, что переменные в `.env` соответствуют полям Settings.
* Рекомендуется выставить `extra="ignore"` в Settings, чтобы новые переменные не ломали запуск.
* Для списков (CORS) проще хранить CSV строкой и парсить вручную.

### 9.5 DB недоступна / auth errors

* Проверь состояние сервисов:

```powershell
docker compose -f .\infra\docker-compose.stack.yml ps
docker compose -f .\infra\docker-compose.stack.yml logs -f db
docker compose -f .\infra\docker-compose.stack.yml logs -f api
```

* Убедись, что `DATABASE_URL` внутри docker указывает на `db:5432`, а локально — на `localhost:5432`.

### 9.6 "snapshot ... does not exist" при сборке Docker

Это баг/битый build-cache. Решение:

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

Остановить и удалить контейнеры:

```powershell
docker compose -f .\infra\docker-compose.stack.yml down
```

Посмотреть логи:

```powershell
docker compose -f .\infra\docker-compose.stack.yml logs -f api
docker compose -f .\infra\docker-compose.stack.yml logs -f bot
```

Зайти в контейнер API:

```powershell
docker compose -f .\infra\docker-compose.stack.yml exec api sh
```

```

---

## 2) PyCharm Run Configurations, которые стоит сохранить

1) **API (local) — Uvicorn**
- Type: Python
- Module name: `uvicorn`
- Parameters: `app.main:app --reload --host 127.0.0.1 --port 8000`
- Working directory: `A:\online-library\backend\src`
- EnvFile: `A:\online-library\backend\.env`

2) **Alembic upgrade head (local)**
- Type: Python
- Module name: `alembic`
- Parameters: `upgrade head`
- Working directory: `A:\online-library\backend`
- EnvFile: `A:\online-library\backend\.env`

3) **Pytest (backend)**
- Type: Python tests → pytest
- Target: `A:\online-library\backend`
- Additional args: `-q`
- EnvFile: `A:\online-library\backend\.env` (или отдельный `.env.test`)

4) **Bot (local)**
- Type: Python
- Module name: `bot_app`
- Working directory: `A:\online-library\bot\src`
- EnvFile: `A:\online-library\bot\.env`

5) **Miniapp (npm dev)**
- Type: npm
- Package.json: `A:\online-library\miniapp\package.json`
- Script: `dev`

6) **Docker Compose Up (stack)**
- Type: Docker Compose
- File: `A:\online-library\infra\docker-compose.stack.yml`
- Command: `up -d --build`

7) **Docker Compose Down (stack)**
- Type: Docker Compose
- File: `A:\online-library\infra\docker-compose.stack.yml`
- Command: `down`

8) (Опционально) **Docker Logs API**
- Type: Shell Script / External tool
- Command: `docker compose -f .\infra\docker-compose.stack.yml logs -f api`
- Working directory: `A:\online-library`

Если хочешь, могу ещё добавить “API in Docker (exec uvicorn)”, но обычно хватает стандартного compose.
::contentReference[oaicite:0]{index=0}
```
