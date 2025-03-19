from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mutfak Yazılım API"
    PROJECT_VERSION: str = "1.0.0"
    
    # PostgreSQL Bağlantı Ayarları
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "mutfakyazilim"
    DATABASE_URL: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@mutfakyazilim.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8080")
    
    # SMTP Ayarları
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "email-smtp.eu-north-1.amazonaws.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "AKIAVWABJ3VGYGRLSDWA")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "BKUu+XQmZ2RoT0tUag3mbJaOsVtVrLVR5BNoYw3kWQe1")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "contact@mutfakyazilim.com")
    SMTP_TLS: bool = os.getenv("SMTP_TLS", "True").lower() in ("true", "1", "t")
    
    # E-posta Bildirim Ayarları
    ENABLE_EMAIL_NOTIFICATIONS: bool = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "True").lower() in ("true", "1", "t")
    NOTIFY_ON_LOW_RATING: bool = os.getenv("NOTIFY_ON_LOW_RATING", "True").lower() in ("true", "1", "t")
    LOW_RATING_THRESHOLD: int = int(os.getenv("LOW_RATING_THRESHOLD", "3"))
    
    CORS_ORIGINS: list = [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost",
        "http://*.localhost",
        "http://*.mutfakyazilim.com",
        "*",  # Tüm originlere izin ver (geliştirme aşamasında)
    ]

    class Config:
        env_file = ".env"

settings = Settings() 