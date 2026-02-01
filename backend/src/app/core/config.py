from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/src/app/core/config.py -> parents:
# core(0) -> app(1) -> src(2) -> backend(3)
BACKEND_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    # .env variables:
    app_name: str = Field(default="online-library", validation_alias="APP_NAME")
    env: str = Field(default="local", validation_alias="ENV")

    # Optional (если в .env нет — будет INFO)
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    database_url: str = Field(
        default="postgresql+asyncpg://postgres:713@localhost:5432/online_library",
        validation_alias="DATABASE_URL",
    )

    jwt_secret: str = Field(default="CHANGE_ME_SUPER_SECRET", validation_alias="JWT_SECRET")
    jwt_alg: str = Field(default="HS256", validation_alias="JWT_ALG")
    jwt_expires_min: int = Field(default=60, validation_alias="JWT_EXPIRES_MIN")

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",  # backend/.env
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
