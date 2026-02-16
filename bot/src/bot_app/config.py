from pydantic import AnyHttpUrl, Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    BOT_TOKEN: str
    API_BASE_URL: AnyHttpUrl

    miniapp_url: AnyHttpUrl | None = Field(
        default=None,
        validation_alias=AliasChoices("MINIAPP_URL", "miniapp_url"),
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
