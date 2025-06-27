from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password_with_salt,
    generate_salt,
    hash_password_with_salt
)
from app.models.user import User
from app.models.customer import Customer
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.api.v1.dependencies.auth import get_current_active_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password_with_salt(
        form_data.password, user.salt, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    # Update last login
    from sqlalchemy.sql import func
    user.last_login = func.now()
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.username, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserSchema)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register a new user
    """
    # Check if user already exists
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this username already exists"
        )
    
    if user_in.email:
        user = db.query(User).filter(User.email == user_in.email).first()
        if user:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists"
            )
    
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
            name=user_in.username,  # Default name, can be updated later
            phone="",  # Will be updated in profile
            email=user_in.email
        )
        db.add(customer)
        db.commit()
    
    return user

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current user
    """
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    user_in: dict,
) -> Any:
    """
    Update current user
    """
    # Update allowed fields
    if "email" in user_in and user_in["email"]:
        # Check if email is already taken
        existing_user = db.query(User).filter(
            User.email == user_in["email"], 
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists"
            )
        current_user.email = user_in["email"]
    
    db.commit()
    db.refresh(current_user)
    return current_user