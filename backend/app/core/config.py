from functools import lru_cache

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    PROJECT_NAME: str = "UyMap API"
    ENVIRONMENT: str = "local"
    DATABASE_URL: str = "postgresql+psycopg://uymap:uymap@localhost:5432/uymap"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    BACKEND_CORS_ORIGINS: list[AnyHttpUrl] | list[str] = ["http://localhost:5173"]
    MEDIA_ROOT: str = "uploads"
    MEDIA_URL: str = "/media"
    TELEGRAM_BOT_TOKEN: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
