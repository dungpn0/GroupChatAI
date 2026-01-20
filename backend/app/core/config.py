from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./groupchatai.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Authentication
    JWT_SECRET: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24 * 7  # 7 days
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # AI APIs
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_GEMINI_API_KEY: Optional[str] = None
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]
    
    # App settings
    PROJECT_NAME: str = "GroupChatAI"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Credit system
    DEFAULT_USER_CREDITS: float = 100.0
    GEMINI_CREDIT_RATE: float = 0.1
    OPENAI_GPT4_CREDIT_RATE: float = 0.2
    OPENAI_GPT35_CREDIT_RATE: float = 0.1
    
    # Email settings (for invitations)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()