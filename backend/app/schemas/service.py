from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price_per_unit: float
    unit: str = "kg"
    service_type: str = "standard"
    turnaround_hours: Optional[int] = None
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_unit: Optional[float] = None
    unit: Optional[str] = None
    service_type: Optional[str] = None
    turnaround_hours: Optional[int] = None
    is_active: Optional[bool] = None

class ServiceInDB(ServiceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Service(ServiceInDB):
    pass