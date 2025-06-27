import logging
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import generate_salt, hash_password_with_salt
from app.models.user import User
from app.models.customer import Customer
from app.models.service import Service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    """
    Initialize database with default data
    """
    # Create default admin user
    admin = db.query(User).filter(User.username == settings.FIRST_SUPERUSER_USERNAME).first()
    if not admin:
        salt = generate_salt()
        hashed_password = hash_password_with_salt(settings.FIRST_SUPERUSER_PASSWORD, salt)
        
        admin = User(
            username=settings.FIRST_SUPERUSER_USERNAME,
            email=settings.FIRST_SUPERUSER_EMAIL,
            password_hash=hashed_password,
            salt=salt,
            role="admin",
            is_active=True
        )
        db.add(admin)
        logger.info("Created default admin user")
    
    # Create staff user
    staff = db.query(User).filter(User.username == "staff1").first()
    if not staff:
        salt = generate_salt()
        hashed_password = hash_password_with_salt("staff123", salt)
        
        staff = User(
            username="staff1",
            email="staff@laundryconnect.co.ke",
            password_hash=hashed_password,
            salt=salt,
            role="staff",
            is_active=True
        )
        db.add(staff)
        logger.info("Created default staff user")
    
    # Create demo customer
    customer_user = db.query(User).filter(User.username == "john_doe").first()
    if not customer_user:
        salt = generate_salt()
        hashed_password = hash_password_with_salt("password123", salt)
        
        customer_user = User(
            username="john_doe",
            email="john@example.com",
            password_hash=hashed_password,
            salt=salt,
            role="customer",
            is_active=True
        )
        db.add(customer_user)
        db.flush()  # Get the ID
        
        # Create customer profile
        customer_profile = Customer(
            user_id=customer_user.id,
            name="John Doe",
            phone="+254712345678",
            email="john@example.com",
            address="123 Demo Street, Nairobi",
            location_name="Home",
            location_lat=-1.2921,
            location_lng=36.8219
        )
        db.add(customer_profile)
        logger.info("Created demo customer user")
    
    # Create default services
    default_services = [
        {
            "name": "Standard Wash & Iron",
            "description": "Regular washing and ironing service with 48-hour turnaround",
            "price_per_unit": 200.0,
            "unit": "kg",
            "service_type": "standard",
            "turnaround_hours": 48
        },
        {
            "name": "Express Wash & Iron",
            "description": "Priority washing and ironing service with 24-hour turnaround",
            "price_per_unit": 200.0,  # Base price, multiplier applied automatically
            "unit": "kg",
            "service_type": "express",
            "turnaround_hours": 24
        },
        {
            "name": "Premium Care Service",
            "description": "Delicate fabric care with special handling and 72-hour turnaround",
            "price_per_unit": 200.0,  # Base price, multiplier applied automatically
            "unit": "kg",
            "service_type": "premium",
            "turnaround_hours": 72
        },
        {
            "name": "Wash Only",
            "description": "Washing service without ironing",
            "price_per_unit": 120.0,
            "unit": "kg",
            "service_type": "standard",
            "turnaround_hours": 24
        },
        {
            "name": "Iron Only",
            "description": "Ironing service for clean clothes",
            "price_per_unit": 100.0,
            "unit": "kg",
            "service_type": "standard",
            "turnaround_hours": 12
        }
    ]
    
    for service_data in default_services:
        existing_service = db.query(Service).filter(Service.name == service_data["name"]).first()
        if not existing_service:
            service = Service(**service_data)
            db.add(service)
            logger.info(f"Created service: {service_data['name']}")
    
    db.commit()
    logger.info("Database initialization completed")