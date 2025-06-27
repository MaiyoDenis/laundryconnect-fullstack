from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.order import Order
from app.models.customer import Customer
from app.models.service import Service
# Update the import path below if the dependency has moved, or ensure the file exists at the specified location.
from app.api.v1.dependencies.auth import get_current_staff_or_admin

router = APIRouter()

@router.get("/overview")
def get_overview_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_or_admin),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
) -> Any:
    """
    Get overview report with key metrics
    """
    # Default date range (last 30 days)
    if not date_from:
        date_from = date.today() - timedelta(days=30)
    if not date_to:
        date_to = date.today()
    
    # Base query for date range
    base_query = db.query(Order).filter(
        Order.created_at >= date_from,
        Order.created_at <= date_to
    )
    
    # Order statistics
    total_orders = base_query.count()
    completed_orders = base_query.filter(Order.status == "delivered").count()
    pending_orders = base_query.filter(Order.status.in_(["placed", "confirmed"])).count()
    cancelled_orders = base_query.filter(Order.status == "cancelled").count()
    
    # Revenue statistics
    total_revenue = base_query.filter(Order.status == "delivered").with_entities(
        func.coalesce(func.sum(Order.final_price), 0)
    ).scalar() or 0
    
    avg_order_value = 0
    if completed_orders > 0:
        avg_order_value = total_revenue / completed_orders
    
    # Customer statistics
    total_customers = db.query(Customer).count()
    new_customers = db.query(Customer).filter(
        Customer.created_at >= date_from,
        Customer.created_at <= date_to
    ).count()
    
    # Performance metrics
    completion_rate = 0
    if total_orders > 0:
        completion_rate = (completed_orders / total_orders) * 100
    
    return {
        "date_range": {
            "from": date_from,
            "to": date_to
        },
        "orders": {
            "total": total_orders,
            "completed": completed_orders,
            "pending": pending_orders,
            "cancelled": cancelled_orders,
            "completion_rate": round(completion_rate, 2)
        },
        "revenue": {
            "total": float(total_revenue),
            "average_order_value": round(avg_order_value, 2)
        },
        "customers": {
            "total": total_customers,
            "new": new_customers
        }
    }

@router.get("/revenue")
def get_revenue_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_or_admin),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
) -> Any:
    """
    Get detailed revenue report
    """
    if not date_from:
        date_from = date.today() - timedelta(days=30)
    if not date_to:
        date_to = date.today()
    
    # Revenue by service
    revenue_by_service = db.query(
        Service.name,
        func.coalesce(func.sum(Order.final_price), 0).label("revenue"),
        func.count(Order.id).label("orders")
    ).join(Order).filter(
        Order.created_at >= date_from,
        Order.created_at <= date_to,
        Order.status == "delivered"
    ).group_by(Service.id, Service.name).all()
    
    # Daily revenue trend
    daily_revenue = db.query(
        func.date(Order.created_at).label("date"),
        func.coalesce(func.sum(Order.final_price), 0).label("revenue"),
        func.count(Order.id).label("orders")
    ).filter(
        Order.created_at >= date_from,
        Order.created_at <= date_to,
        Order.status == "delivered"
    ).group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at)).all()
    
    # Monthly revenue (last 12 months)
    twelve_months_ago = date.today().replace(day=1) - timedelta(days=365)
    monthly_revenue = db.query(
        extract('year', Order.created_at).label('year'),
        extract('month', Order.created_at).label('month'),
        func.coalesce(func.sum(Order.final_price), 0).label("revenue"),
        func.count(Order.id).label("orders")
    ).filter(
        Order.created_at >= twelve_months_ago,
        Order.status == "delivered"
    ).group_by(
        extract('year', Order.created_at),
        extract('month', Order.created_at)
    ).order_by(
        extract('year', Order.created_at),
        extract('month', Order.created_at)
    ).all()
    
    return {
        "revenue_by_service": [
            {
                "service_name": row.name,
                "revenue": float(row.revenue),
                "orders": row.orders
            }
            for row in revenue_by_service
        ],
        "daily_revenue": [
            {
                "date": row.date.isoformat(),
                "revenue": float(row.revenue),
                "orders": row.orders
            }
            for row in daily_revenue
        ],
        "monthly_revenue": [
            {
                "year": int(row.year),
                "month": int(row.month),
                "revenue": float(row.revenue),
                "orders": row.orders
            }
            for row in monthly_revenue
        ]
    }

@router.get("/customers")
def get_customer_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_or_admin),
) -> Any:
    """
    Get customer analytics report
    """
    # Top customers by revenue
    top_customers = db.query(
        Customer.id,
        Customer.name,
        Customer.phone,
        func.count(Order.id).label("total_orders"),
        func.coalesce(func.sum(Order.final_price), 0).label("total_spent")
    ).join(Order).filter(
        Order.status == "delivered"
    ).group_by(Customer.id, Customer.name, Customer.phone).order_by(
        desc(func.coalesce(func.sum(Order.final_price), 0))
    ).limit(10).all()
    
    # Customer growth by month (last 12 months)
    twelve_months_ago = date.today().replace(day=1) - timedelta(days=365)
    customer_growth = db.query(
        extract('year', Customer.created_at).label('year'),
        extract('month', Customer.created_at).label('month'),
        func.count(Customer.id).label("new_customers")
    ).filter(
        Customer.created_at >= twelve_months_ago
    ).group_by(
        extract('year', Customer.created_at),
        extract('month', Customer.created_at)
    ).order_by(
        extract('year', Customer.created_at),
        extract('month', Customer.created_at)
    ).all()
    
    # Customer segments
    total_customers = db.query(Customer).count()
    active_customers = db.query(Customer).join(Order).filter(
        Order.created_at >= date.today() - timedelta(days=90)
    ).distinct().count()
    
    return {
        "top_customers": [
            {
                "id": row.id,
                "name": row.name,
                "phone": row.phone,
                "total_orders": row.total_orders,
                "total_spent": float(row.total_spent)
            }
            for row in top_customers
        ],
        "customer_growth": [
            {
                "year": int(row.year),
                "month": int(row.month),
                "new_customers": row.new_customers
            }
            for row in customer_growth
        ],
        "customer_segments": {
            "total": total_customers,
            "active_last_90_days": active_customers,
            "inactive": total_customers - active_customers
        }
    }

@router.get("/orders")
def get_orders_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff_or_admin),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
) -> Any:
    """
    Get orders analytics report
    """
    if not date_from:
        date_from = date.today() - timedelta(days=30)
    if not date_to:
        date_to = date.today()
    
    # Orders by status
    orders_by_status = db.query(
        Order.status,
        func.count(Order.id).label("count")
    ).filter(
        Order.created_at >= date_from,
        Order.created_at <= date_to
    ).group_by(Order.status).all()
    
    # Orders by service type
    orders_by_service = db.query(
        Service.service_type,
        func.count(Order.id).label("count"),
        func.avg(Order.final_price).label("avg_price")
    ).join(Order).filter(
        Order.created_at >= date_from,
        Order.created_at <= date_to
    ).group_by(Service.service_type).all()
    
    # Average turnaround time (for completed orders)
    avg_turnaround = db.query(
        func.avg(
            func.julianday(Order.delivery_date) - func.julianday(Order.pickup_date)
        ).label("avg_days")
    ).filter(
        Order.created_at >= date_from,
        Order.created_at <= date_to,
        Order.status == "delivered",
        Order.delivery_date.isnot(None)
    ).scalar()
    
    return {
        "orders_by_status": [
            {
                "status": row.status,
                "count": row.count
            }
            for row in orders_by_status
        ],
        "orders_by_service_type": [
            {
                "service_type": row.service_type,
                "count": row.count,
                "avg_price": float(row.avg_price) if row.avg_price else 0
            }
            for row in orders_by_service
        ],
        "performance": {
            "avg_turnaround_days": float(avg_turnaround) if avg_turnaround else 0
        }
    }