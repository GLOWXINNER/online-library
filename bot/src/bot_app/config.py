from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl


class Settings(BaseSettings):
    BOT_TOKEN: str
    API_BASE_URL: AnyHttpUrl

    # удобно, чтобы локально читать из .env без плясок
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
