from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union, Any
from pydantic import field_validator
import json

class Settings(BaseSettings):
    PROJECT_NAME: str = "CoinFlow API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql://postgres:1234@localhost:5432/coinflow_db"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["*"]
    RATE_LIMIT_PER_MINUTE: int = 120

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str in ["*", '["*"]', "'*'"]:
                return ["*"]
            try:
                return json.loads(v_str)
            except Exception:
                return [i.strip() for i in v_str.split(",")]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
