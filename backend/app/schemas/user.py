from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Base User Schema
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    role: str = "customer"
    is_active: bool = True

from typing import Optional

class UserCreate(UserBase):
    password: str
    # Add customer profile fields
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    location_name: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class User(UserInDB):
    pass

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None