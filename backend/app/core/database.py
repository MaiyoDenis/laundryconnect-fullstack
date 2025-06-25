from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


from app.core.config import settings

# Database setup
if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgresql"):
    # PostgreSQL
    engine = create_engine(settings.DATABASE_URL)
elif settings.DATABASE_URL and settings.DATABASE_URL.startswith("sqlite"):
    # SQLite
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # Default to SQLite
    engine = create_engine(
        settings.SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()