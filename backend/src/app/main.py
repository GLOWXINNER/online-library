from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from app.api import api_router
from app.core.config import settings
from app.core.errors import add_exception_handlers
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    logger.info(
        "Starting application. env={} db_url_set={}",
        settings.env,
        bool(settings.database_url),
    )
    yield
    # shutdown (если надо будет — сюда)


def create_app() -> FastAPI:
    setup_logging()

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,  # ✅ вместо on_event
    )

    add_exception_handlers(app)
    app.include_router(api_router)

    return app


app = create_app()


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # если будешь открывать по LAN-адресу:
        "http://192.168.1.63:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)