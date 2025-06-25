from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from passlib.hash import bcrypt
from fastapi import HTTPException, status
import secrets
import string

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = payload.get("sub")
        return token_data
    except JWTError:
        return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def generate_salt(length: int = 32) -> str:
    """Generate a random salt for additional password security"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def hash_password_with_salt(password: str, salt: str) -> str:
    """Hash password with custom salt for compatibility with existing system"""
    # Combine password and salt
    salted_password = password + salt
    return get_password_hash(salted_password)

def verify_password_with_salt(password: str, salt: str, hashed_password: str) -> bool:
    """Verify password with custom salt"""
    salted_password = password + salt
    return verify_password(salted_password, hashed_password)