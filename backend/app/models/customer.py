from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_name = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    
    def __repr__(self):
        return f"<Customer(id={self.id}, name='{self.name}', phone='{self.phone}')>"