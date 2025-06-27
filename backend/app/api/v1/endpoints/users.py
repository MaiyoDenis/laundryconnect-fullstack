from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import generate_salt, hash_password_with_salt
from app.models.user import User
from app.models.customer import Customer
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from ..dependencies.auth import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
) -> Any:
    """
    Retrieve users (admin only)
    """
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    
    if search:
        query = query.filter(
            (User.username.contains(search)) |
            (User.email.contains(search))
        )
    
    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)
    
    # Order by creation date (newest first)
    query = query.order_by(desc(User.created_at))
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserSchema)
def read_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Get user by ID (admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Create new user (admin only)
    """
    # Check if user already exists
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(status_code=400, detail="A user with this username already exists")
    
    if user_in.email:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(status_code=400, detail="A user with this email already exists")
    
    # Validate role
    valid_roles = ["customer", "staff", "admin"]
    if user_in.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Create new user
    salt = generate_salt()
    hashed_password = hash_password_with_salt(user_in.password, salt)
    
    user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password,
        salt=salt,
        role=user_in.role,
        is_active=user_in.is_active
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # If user is a customer, create customer profile
    if user.role == "customer":
        customer = Customer(
            user_id=user.id,
            name=user_in.username,
            phone="",
            email=user_in.email
        )
        db.add(customer)
        db.commit()
    
    return user

@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update user (admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if new username conflicts
    if user_in.username and user_in.username != user.username:
        existing_user = db.query(User).filter(User.username == user_in.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="A user with this username already exists")
    
    # Check if new email conflicts
    if user_in.email and user_in.email != user.email:
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="A user with this email already exists")
    
    # Validate role if provided
    if user_in.role:
        valid_roles = ["customer", "staff", "admin"]
        if user_in.role not in valid_roles:
            raise HTTPException(status_code=400, detail="Invalid role")
    
    # Update user
    update_data = user_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Delete user (admin only)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    # Check if user has associated data
    if user.role == "customer":
        customer = db.query(Customer).filter(Customer.user_id == user_id).first()
        if customer:
            from app.models.order import Order
            orders_count = db.query(Order).filter(Order.customer_id == customer.id).count()
            if orders_count > 0:
                # Don't delete, just deactivate
                user.is_active = False
                db.commit()
                return {"message": f"User deactivated (had {orders_count} associated orders)"}
    
    # Delete user
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/stats/overview")
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Get user statistics overview (admin only)
    """
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    # Total users by role
    total_users = db.query(func.count(User.id)).scalar()
    customers = db.query(func.count(User.id)).filter(User.role == "customer").scalar()
    staff = db.query(func.count(User.id)).filter(User.role == "staff").scalar()
    admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar()
    
    # Active/Inactive users
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    inactive_users = db.query(func.count(User.id)).filter(User.is_active == False).scalar()
    
    # Recent registrations (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_registrations = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar()
    
    return {
        "total_users": total_users,
        "users_by_role": {
            "customers": customers,
            "staff": staff,
            "admins": admins
        },
        "users_by_status": {
            "active": active_users,
            "inactive": inactive_users
        },
        "recent_registrations": recent_registrations
    }