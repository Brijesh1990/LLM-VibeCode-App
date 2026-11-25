import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "LMS"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "enterprise_lms_super_secret_key_2026_vibe_coding_prod_ready"
    JWT_SECRET_KEY: str = "enterprise_lms_jwt_signing_secret_key_2026_hs256_secure"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "lms_db"
    DB_USER: str = "root"
    DB_PASSWORD: str = "admin"
    DATABASE_URL: str = "mysql+pymysql://root:admin@localhost:3306/lms_db"

    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@nexuslms.edu"

    STORAGE_PROVIDER: str = "local"
    STORAGE_BUCKET: str = ""
    STORAGE_ACCESS_KEY: str = ""
    STORAGE_SECRET_KEY: str = ""
    STORAGE_REGION: str = ""

    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_FILE_EXTENSIONS: str = "pdf,ppt,pptx,doc,docx,zip,jpg,jpeg,png,mp4"

    LOG_LEVEL: str = "INFO"

    PAYMENT_GATEWAY: str = "razorpay_test"
    PAYMENT_KEY_ID: str = "rzp_test_NexusLms2026Key"
    PAYMENT_KEY_SECRET: str = "rzp_test_secret_nexus2026"
    PAYMENT_CURRENCY: str = "USD"

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def allowed_extensions_set(self) -> set[str]:
        return {e.strip().lower() for e in self.ALLOWED_FILE_EXTENSIONS.split(",") if e.strip()}

    @property
    def upload_dir(self) -> Path:
        if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
            p = Path("/tmp") / "uploads"
        else:
            p = BASE_DIR / "uploads"
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
