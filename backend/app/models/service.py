from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

service_location_association = Table(
    "service_location_association",
    Base.metadata,
    Column("service_id", Integer, ForeignKey("services.id"), primary_key=True),
    Column("location_id", Integer, ForeignKey("locations.id"), primary_key=True),
)

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    price_per_unit = Column(Float, nullable=False)
    unit = Column(String(10), nullable=False, default="kg")
    service_type = Column(String(20), default="standard", nullable=False)  # standard, express, premium
    turnaround_hours = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    orders = relationship("Order", back_populates="service")
    locations = relationship(
        "Location",
        secondary=service_location_association,
        back_populates="services"
    )
    
    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}', type='{self.service_type}')>"
