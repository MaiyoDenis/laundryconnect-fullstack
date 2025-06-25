from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    estimated_weight = Column(Float, nullable=False)
    actual_weight = Column(Float, nullable=True)
    total_price = Column(Float, nullable=False)
    final_price = Column(Float, nullable=True)
    status = Column(String(20), default="placed", nullable=False)
    pickup_date = Column(Date, nullable=False)
    pickup_time = Column(String(20), nullable=False)
    delivery_date = Column(Date, nullable=True)
    service_options = Column(String(20), nullable=True)  # washing, ironing, both
    special_instructions = Column(Text, nullable=True)
    customer_notes = Column(Text, nullable=True)
    staff_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    customer = relationship("Customer", back_populates="orders")
    service = relationship("Service", back_populates="orders")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")
    reviews = relationship("OrderReview", back_populates="order", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Order(id={self.id}, number='{self.order_number}', status='{self.status}')>"

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(String(20), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    updated_by = Column(String(100), nullable=True)  # Username of who updated
    
    # Relationships
    order = relationship("Order", back_populates="status_history")
    
    def __repr__(self):
        return f"<OrderStatusHistory(order_id={self.order_id}, status='{self.status}')>"

class OrderReview(Base):
    __tablename__ = "order_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="reviews")
    
    def __repr__(self):
        return f"<OrderReview(order_id={self.order_id}, rating={self.rating})>"