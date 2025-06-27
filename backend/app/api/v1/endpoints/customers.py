from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.models.user import User
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import Customer as CustomerSchema, CustomerCreate, CustomerUpdate
from app.api.v1.dependencies.auth import get_current_active_user, get_current_staff_or_admin

router = APIRouter()

@router.get("/me", response_model=CustomerSchema)
def read_customer_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get current customer profile
    """
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Not a customer")
    
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    # Add computed fields
    total_orders = db.query(func.count(Order.id)).filter(Order.customer_id == customer.id).scalar()
    total_spent = db.query(func.coalesce(func.sum(Order.final_price), 0)).filter(
        Order.customer_id == customer.id,
        Order.status == "delivered"
    ).scalar()
    
    customer_dict = customer.__dict__.copy()
    customer_dict['total_orders'] = total_orders or 0
    customer_dict['total_spent'] = float(total_spent or 0)
    
    return customer_dict

@router.put("/me", response_model=CustomerSchema)
def update_customer_me(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    customer_in: CustomerUpdate,
) -> Any:
    """
    Update current customer profile
    """
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Not a customer")
    
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        # Create customer profile if it doesn't exist
        customer = Customer(
            user_id=current_user.id,
            name=customer_in.name or current_user.username,
            phone=customer_in.phone or "",
            email=customer_in.email or current_user.email
        )
        db.add(customer)
    else:
        # Update existing customer
        update_data = customer_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(customer, field, value)
    
    db.commit()
    db.refresh(customer)
    return customer

@router.get("/", response_model=List[CustomerSchema])
def read_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_or_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
) -> Any:
    """
    Retrieve customers (staff/admin only)
    """
    query = db.query(Customer)
    
    # Apply filters
    if search:
        query = query.filter(
            (Customer.name.contains(search)) |
            (Customer.phone.contains(search)) |
            (Customer.email.contains(search))
        )
    
    if location:
        query = query.filter(Customer.location_name.contains(location))
    
    customers = query.offset(skip).limit(limit).all()
    
    # Add computed fields for each customer
    result = []
    for customer in customers:
        total_orders = db.query(func.count(Order.id)).filter(Order.customer_id == customer.id).scalar()
        total_spent = db.query(func.coalesce(func.sum(Order.final_price), 0)).filter(
            Order.customer_id == customer.id,
            Order.status == "delivered"
        ).scalar()
        last_order = db.query(func.max(Order.created_at)).filter(Order.customer_id == customer.id).scalar()
        
        customer_dict = customer.__dict__.copy()
        customer_dict['total_orders'] = total_orders or 0
        customer_dict['total_spent'] = float(total_spent or 0)
        customer_dict['last_order'] = last_order
        
        result.append(customer_dict)
    
    return result

@router.get("/{customer_id}", response_model=CustomerSchema)
def read_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    current_user: User = Depends(get_current_staff_or_admin),
) -> Any:
    """
    Get customer by ID (staff/admin only)
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return customer

@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    *,
    db: Session = Depends(get_db),
    customer_id: int,
    customer_in: CustomerUpdate,
    current_user: User = Depends(get_current_staff_or_admin),
) -> Any:
    """
    Update customer (staff/admin only)
    """
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    db.commit()
    db.refresh(customer)
    return customer