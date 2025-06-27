from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc
from datetime import datetime, date
import secrets
import string

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.customer import Customer
from app.models.order import Order, OrderStatusHistory as OrderStatusHistoryModel, OrderReview
from app.models.service import Service
from app.schemas.order import (
    Order as OrderSchema,
    OrderCreate,
    OrderUpdate,
    OrderStatusUpdate,
    OrderWeightUpdate,
    OrderReview as OrderReviewSchema,
    OrderReviewCreate,
    OrderStatusHistory as OrderStatusHistorySchema,
)
from app.api.v1.dependencies.auth import (
    get_current_active_user,
    get_current_customer,
    get_current_staff_or_admin
)

router = APIRouter()

def generate_order_number() -> str:
    """Generate unique order number"""
    prefix = "LC"
    timestamp = datetime.now().strftime("%y%m%d")
    random_part = ''.join(secrets.choice(string.digits) for _ in range(4))
    return f"{prefix}{timestamp}{random_part}"

def calculate_order_price(service: Service, weight: float) -> float:
    """Calculate order price based on service and weight"""
    base_price = service.price_per_unit * weight
    multiplier = settings.DEFAULT_SERVICE_MULTIPLIERS.get(service.service_type, 1.0)
    return base_price * multiplier

@router.post("/", response_model=OrderSchema)
def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_customer),
) -> Any:
    """
    Create new order (customer only)
    """
    # Get customer profile
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Customer profile not found. Please complete your profile first.")
    
    # Get service
    service = db.query(Service).filter(
        Service.id == order_in.service_id,
        Service.is_active == True
    ).first()
    if not service:
        raise HTTPException(status_code=400, detail="Service not found or inactive")
    
    # Generate order number
    order_number = generate_order_number()
    while db.query(Order).filter(Order.order_number == order_number).first():
        order_number = generate_order_number()
    
    # Calculate total price
    total_price = calculate_order_price(service, order_in.estimated_weight)
    
    # Create order
    order = Order(
        order_number=order_number,
        customer_id=customer.id,
        service_id=order_in.service_id,
        estimated_weight=order_in.estimated_weight,
        total_price=total_price,
        status="placed",
        pickup_date=order_in.pickup_date,
        pickup_time=order_in.pickup_time,
        service_options=order_in.service_options,
        special_instructions=order_in.special_instructions
    )
    
    db.add(order)
    db.flush()  # Flush to get the order ID
    
    # Create initial status history
    status_history = OrderStatusHistoryModel(
        order_id=order.id,
        status="placed",
        notes="Order placed by customer",
        updated_by=current_user.username
    )
    
    db.add(status_history)
    db.commit()
    db.refresh(order)
    
    # Load relationships
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.service),
        joinedload(Order.status_history),
        joinedload(Order.reviews)
    ).filter(Order.id == order.id).first()
    
    return order

@router.get("/", response_model=List[OrderSchema])
def read_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
) -> Any:
    """
    Retrieve orders (customer sees own orders, staff/admin see all)
    """
    query = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.service),
        joinedload(Order.status_history),
        joinedload(Order.reviews)
    )
    
    # Customer can only see their own orders
    if current_user.role == "customer":
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer:
            return []
        query = query.filter(Order.customer_id == customer.id)
    
    # Apply filters
    if status:
        query = query.filter(Order.status == status)
    
    if date_from:
        query = query.filter(Order.created_at >= date_from)
    
    if date_to:
        query = query.filter(Order.created_at <= date_to)
    
    if search:
        query = query.filter(
            (Order.order_number.contains(search)) |
            (Order.customer.has(Customer.name.contains(search))) |
            (Order.customer.has(Customer.phone.contains(search)))
        )
    
    # Order by creation date (newest first)
    query = query.order_by(desc(Order.created_at))
    
    orders = query.offset(skip).limit(limit).all()
    return orders

@router.get("/{order_id}", response_model=OrderSchema)
def read_order(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get order by ID
    """
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.service),
        joinedload(Order.status_history),
        joinedload(Order.reviews)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Customer can only see their own orders
    if current_user.role == "customer":
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer or order.customer_id != customer.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return order

@router.put("/{order_id}/status", response_model=OrderSchema)
def update_order_status(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_staff_or_admin),
) -> Any:
    """
    Update order status (staff/admin only)
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Validate status transition
    valid_statuses = [
        "placed", "confirmed", "collected", "washing", 
        "ironing", "ready", "out_for_delivery", "delivered", "cancelled"
    ]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    # Update order status
    old_status = order.status
    order.status = status_update.status
    
    # Set delivery date if delivered
    if status_update.status == "delivered" and not order.delivery_date:
        order.delivery_date = date.today()
    
    # Create status history entry
    status_history = OrderStatusHistoryModel(
        order_id=order.id,
        status=status_update.status,
        notes=status_update.notes or f"Status changed from {old_status} to {status_update.status}",
        updated_by=current_user.username
    )
    
    db.add(status_history)
    db.commit()
    db.refresh(order)
    
    # Load relationships
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.service),
        joinedload(Order.status_history),
        joinedload(Order.reviews)
    ).filter(Order.id == order.id).first()
    
    return order

@router.put("/{order_id}/weight", response_model=OrderSchema)
def update_order_weight(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    weight_update: OrderWeightUpdate,
    current_user: User = Depends(get_current_staff_or_admin),
) -> Any:
    """
    Update order actual weight and recalculate price (staff/admin only)
    """
    order = db.query(Order).options(
        joinedload(Order.service)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if weight_update.actual_weight <= 0:
        raise HTTPException(status_code=400, detail="Weight must be greater than 0")
    
    # Update actual weight
    order.actual_weight = weight_update.actual_weight
    
    # Recalculate final price based on actual weight
    order.final_price = calculate_order_price(order.service, weight_update.actual_weight)
    
    # Create status history entry
    status_history = OrderStatusHistoryModel(
        order_id=order.id,
        status=order.status,
        notes=f"Weight updated to {weight_update.actual_weight}kg. Final price: KSH {order.final_price}",
        updated_by=current_user.username
    )
    
    db.add(status_history)
    db.commit()
    db.refresh(order)
    
    # Load relationships
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.service),
        joinedload(Order.status_history),
        joinedload(Order.reviews)
    ).filter(Order.id == order.id).first()
    
    return order

@router.post("/{order_id}/review", response_model=OrderReviewSchema)
def create_order_review(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    review_in: OrderReviewCreate,
    current_user: User = Depends(get_current_customer),
) -> Any:
    """
    Create order review (customer only, order must be delivered)
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if customer owns this order
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer or order.customer_id != customer.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Check if order is delivered
    if order.status != "delivered":
        raise HTTPException(status_code=400, detail="Can only review delivered orders")
    
    # Check if review already exists
    existing_review = db.query(OrderReview).filter(OrderReview.order_id == order_id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="Order already reviewed")
    
    # Validate rating
    if not 1 <= review_in.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Create review
    review = OrderReview(
        order_id=order_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review

@router.get("/{order_id}/status-history", response_model=List[OrderStatusHistorySchema])
def get_order_status_history(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get order status history
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Customer can only see their own orders
    if current_user.role == "customer":
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer or order.customer_id != customer.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    status_history = db.query(OrderStatusHistoryModel).filter(
        OrderStatusHistoryModel.order_id == order_id
    ).order_by(asc(OrderStatusHistoryModel.timestamp)).all()
    
    return status_history
