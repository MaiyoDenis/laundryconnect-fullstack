from sqlalchemy import Boolean, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(32), nullable=False)
    role = Column(String(20), default="customer", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    customer = relationship("Customer", back_populates="user", uselist=False)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"