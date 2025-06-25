from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, BaseSettings, EmailStr, HttpUrl, PostgresDsn, validator
from decouple import config

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LaundryConnect Kenya"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Door-to-door laundry service management system"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:3001",  # Alternative React port
        "http://127.0.0.1:3000",
        "https://localhost:3000",
    ]
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database Configuration
    DATABASE_URL: Optional[PostgresDsn] = config(
        "DATABASE_URL", 
        default="sqlite:///./laundryconnect.db"
    )
    
    # For SQLite (development)
    SQLITE_URL: str = "sqlite:///./laundryconnect.db"
    
    # Security Configuration
    SECRET_KEY: str = config("SECRET_KEY", default="your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 8  # 8 days
    
    # Admin User Configuration
    FIRST_SUPERUSER_EMAIL: EmailStr = config("FIRST_SUPERUSER_EMAIL", default="admin@laundryconnect.co.ke")
    FIRST_SUPERUSER_USERNAME: str = config("FIRST_SUPERUSER_USERNAME", default="admin")
    FIRST_SUPERUSER_PASSWORD: str = config("FIRST_SUPERUSER_PASSWORD", default="admin123")
    
    # Email Configuration (for future use)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Business Configuration
    DEFAULT_SERVICE_MULTIPLIERS: Dict[str, float] = {
        "standard": 1.0,
        "express": 1.5,
        "premium": 2.0
    }
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()