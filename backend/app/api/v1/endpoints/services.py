from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.user import User
from app.models.service import Service
from app.schemas.service import Service as ServiceSchema, ServiceCreate, ServiceUpdate
from app.api.v1.dependencies.auth import get_current_active_user, get_current_admin

router = APIRouter()

@router.get("/", response_model=List[ServiceSchema])
def read_services(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
) -> Any:
    """
    Retrieve services (public endpoint)
    """
    query = db.query(Service)
    
    # Apply filters
    if service_type:
        query = query.filter(Service.service_type == service_type)
    
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    elif is_active is None:
        # Default to active services for public endpoint
        query = query.filter(Service.is_active == True)
    
    # Order by service type and name
    query = query.order_by(Service.service_type, Service.name)
    
    services = query.offset(skip).limit(limit).all()
    return services

@router.get("/{service_id}", response_model=ServiceSchema)
def read_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
) -> Any:
    """
    Get service by ID (public endpoint)
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/", response_model=ServiceSchema)
def create_service(
    *,
    db: Session = Depends(get_db),
    service_in: ServiceCreate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Create new service (admin only)
    """
    # Check if service name already exists
    existing_service = db.query(Service).filter(Service.name == service_in.name).first()
    if existing_service:
        raise HTTPException(status_code=400, detail="Service with this name already exists")
    
    # Validate service type
    valid_types = ["standard", "express", "premium"]
    if service_in.service_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid service type")
    
    # Validate unit
    valid_units = ["kg", "item", "load"]
    if service_in.unit not in valid_units:
        raise HTTPException(status_code=400, detail="Invalid unit")
    
    # Create service
    service = Service(**service_in.dict())
    db.add(service)
    db.commit()
    db.refresh(service)
    
    return service

@router.put("/{service_id}", response_model=ServiceSchema)
def update_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    service_in: ServiceUpdate,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Update service (admin only)
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check if new name conflicts with existing service
    if service_in.name and service_in.name != service.name:
        existing_service = db.query(Service).filter(Service.name == service_in.name).first()
        if existing_service:
            raise HTTPException(status_code=400, detail="Service with this name already exists")
    
    # Validate service type if provided
    if service_in.service_type:
        valid_types = ["standard", "express", "premium"]
        if service_in.service_type not in valid_types:
            raise HTTPException(status_code=400, detail="Invalid service type")
    
    # Validate unit if provided
    if service_in.unit:
        valid_units = ["kg", "item", "load"]
        if service_in.unit not in valid_units:
            raise HTTPException(status_code=400, detail="Invalid unit")
    
    # Update service
    update_data = service_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.commit()
    db.refresh(service)
    
    return service

@router.delete("/{service_id}")
def delete_service(
    *,
    db: Session = Depends(get_db),
    service_id: int,
    current_user: User = Depends(get_current_admin),
) -> Any:
    """
    Delete service (admin only)
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Check if service has associated orders
    from app.models.order import Order
    orders_count = db.query(Order).filter(Order.service_id == service_id).count()
    if orders_count > 0:
        # Don't delete, just deactivate
        service.is_active = False
        db.commit()
        return {"message": f"Service deactivated (had {orders_count} associated orders)"}
    
    # Delete service if no orders
    db.delete(service)
    db.commit()
    
    return {"message": "Service deleted successfully"}

@router.get("/types/available")
def get_service_types() -> Any:
    """
    Get available service types
    """
    return {
        "service_types": [
            {
                "value": "standard",
                "label": "Standard Service",
                "multiplier": 1.0,
                "description": "Regular processing time"
            },
            {
                "value": "express", 
                "label": "Express Service",
                "multiplier": 1.5,
                "description": "Priority processing (+50%)"
            },
            {
                "value": "premium",
                "label": "Premium Service", 
                "multiplier": 2.0,
                "description": "Luxury care (+100%)"
            }
        ],
        "units": ["kg", "item", "load"]
    }