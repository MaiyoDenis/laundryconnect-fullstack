from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime, date
from app.schemas.customer import Customer
from app.schemas.service import Service

class OrderStatusHistoryBase(BaseModel):
    status: str
    notes: Optional[str] = None
    updated_by: Optional[str] = None

class OrderStatusHistory(OrderStatusHistoryBase):
    id: int
    order_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class OrderReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class OrderReviewCreate(OrderReviewBase):
    pass

class OrderReview(OrderReviewBase):
    id: int
    order_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    service_id: int
    estimated_weight: float
    pickup_date: date
    pickup_time: str
    service_options: Optional[str] = None
    special_instructions: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    service_id: Optional[int] = None
    estimated_weight: Optional[float] = None
    actual_weight: Optional[float] = None
    pickup_date: Optional[date] = None
    pickup_time: Optional[str] = None
    delivery_date: Optional[date] = None
    service_options: Optional[str] = None
    special_instructions: Optional[str] = None
    customer_notes: Optional[str] = None
    staff_notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class OrderWeightUpdate(BaseModel):
    actual_weight: float

class OrderInDB(OrderBase):
    id: int
    order_number: str
    customer_id: int
    actual_weight: Optional[float] = None
    total_price: float
    final_price: Optional[float] = None
    status: str
    delivery_date: Optional[date] = None
    customer_notes: Optional[str] = None
    staff_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Order(OrderInDB):
    customer: Optional[Customer] = None
    service: Optional[Service] = None
    status_history: Optional[List[OrderStatusHistory]] = None
    reviews: Optional[List[OrderReview]] = None