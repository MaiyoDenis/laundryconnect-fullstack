# 🧺 LaundryConnect - Full Stack Application

A modern, full-stack web application for managing laundry services, built with FastAPI backend and designed to connect customers with laundry service providers.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

LaundryConnect is a comprehensive platform that bridges the gap between customers needing laundry services and service providers. The application offers seamless booking, tracking, and management of laundry orders with real-time updates and notifications.

## ✨ Features

### For Customers
- 👤 **User Registration & Authentication** - Secure signup/login system
- 📅 **Service Booking** - Easy scheduling of pickup and delivery
- 📍 **Location Services** - GPS-based service provider matching
- 💳 **Payment Integration** - Secure online payment processing
- 📱 **Order Tracking** - Real-time status updates
- ⭐ **Rating & Reviews** - Service provider feedback system
- 📧 **Notifications** - Email and SMS updates

### For Service Providers
- 🏪 **Provider Dashboard** - Comprehensive business management
- 📊 **Analytics** - Revenue and performance insights
- 🚚 **Route Optimization** - Efficient pickup/delivery planning
- 💰 **Pricing Management** - Flexible service pricing
- 👥 **Customer Management** - Client relationship tools

### Admin Features
- 🛠️ **System Administration** - Platform management
- 📈 **Analytics Dashboard** - Business intelligence
- 👮 **User Management** - User verification and support
- 💸 **Payment Management** - Transaction oversight

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.8+** - Programming language
- **Pydantic V2** - Data validation using Python type annotations
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Celery** - Distributed task queue
- **Uvicorn** - ASGI server

### Additional Tools
- **Docker** - Containerization
- **Poetry/Pip** - Dependency management
- **Alembic** - Database migrations
- **Pytest** - Testing framework
- **Black** - Code formatting
- **Flake8** - Code linting

## 📁 Project Structure

```
laundryconnect-fullstack/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── orders.py
│   │   │       └── providers.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── order.py
│   │   │   └── provider.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── order.py
│   │   │   └── provider.py
│   │   ├── crud/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── order.py
│   │   │   └── provider.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── email.py
│   │       └── helpers.py
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── frontend/          # Frontend application (if applicable)
├── docs/             # Documentation
├── .gitignore
├── README.md
└── LICENSE
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **PostgreSQL 12+** - [Download PostgreSQL](https://postgresql.org/download/)
- **Redis** - [Download Redis](https://redis.io/download/)
- **Git** - [Download Git](https://git-scm.com/downloads/)

Optional but recommended:
- **Docker & Docker Compose** - [Download Docker](https://docker.com/get-started/)
- **pyenv** - Python version management

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/laundryconnect-fullstack.git
cd laundryconnect-fullstack/backend
```

### 2. Set Up Python Environment

```bash
# Using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Or using pyenv (recommended)
pyenv install 3.8.13
pyenv virtualenv 3.8.13 laundryconnect
pyenv activate laundryconnect
```

### 3. Install Dependencies

```bash
# Install required packages
pip install -r requirements.txt

# For development dependencies
pip install -r requirements-dev.txt
```

### 4. Install Pydantic Settings (V2 Migration)

```bash
pip install pydantic-settings
```

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/laundryconnect
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=laundryconnect

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_TLS=True
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
PAYMENT_GATEWAY_KEY=your-payment-gateway-key

# Environment
ENVIRONMENT=development
DEBUG=True

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

### 2. Database Setup

```bash
# Create database
createdb laundryconnect

# Run migrations
alembic upgrade head
```

### 3. Update Configuration

Make sure your `app/core/config.py` uses the correct imports for Pydantic V2:

```python
from pydantic import AnyHttpUrl, EmailStr, HttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings  # Updated import
```

## 🏃‍♂️ Usage

### Start the Development Server

```bash
# Basic start
uvicorn main:app --reload

# With custom host and port
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# For production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📚 API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| GET | `/api/v1/users/me` | Get current user |
| POST | `/api/v1/orders` | Create new order |
| GET | `/api/v1/orders` | List user orders |
| GET | `/api/v1/providers` | List service providers |

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_users.py

# Run with verbose output
pytest -v
```

### Test Structure

```
tests/
├── conftest.py          # Test configuration
├── test_auth.py         # Authentication tests
├── test_users.py        # User management tests
├── test_orders.py       # Order management tests
└── test_providers.py    # Provider tests
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Docker Compose Services

- **api**: FastAPI application
- **db**: PostgreSQL database
- **redis**: Redis cache
- **nginx**: Reverse proxy (production)

## 🔧 Development

### Code Formatting

```bash
# Format code with Black
black app/

# Check code style
flake8 app/

# Sort imports
isort app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade migration
alembic downgrade -1
```

### Adding New Dependencies

```bash
# Add new package
pip install package-name

# Update requirements
pip freeze > requirements.txt
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Pydantic Import Error
```
PydanticImportError: `BaseSettings` has been moved to the `pydantic-settings` package
```
**Solution**: Install pydantic-settings and update imports
```bash
pip install pydantic-settings
```

#### 2. Database Connection Error
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solution**: Check PostgreSQL is running and credentials are correct
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

#### 3. Port Already in Use
```
OSError: [Errno 98] Address already in use
```
**Solution**: Kill process using the port or use different port
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

#### 4. Permission Denied
```
PermissionError: [Errno 13] Permission denied
```
**Solution**: Check file permissions and virtual environment activation
```bash
chmod +x scripts/*.sh
source venv/bin/activate
```

### Debug Mode

Enable debug logging in `.env`:
```env
DEBUG=True
LOG_LEVEL=DEBUG
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository

```bash
git fork https://github.com/yourusername/laundryconnect-fullstack.git
```

### 2. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes

- Follow PEP 8 style guidelines
- Add tests for new features
- Update documentation as needed

### 4. Run Tests

```bash
pytest
black app/
flake8 app/
```

### 5. Commit Changes

```bash
git commit -m "Add some amazing feature"
```

### 6. Push to Branch

```bash
git push origin feature/amazing-feature
```

### 7. Open Pull Request

Submit a pull request with:
- Clear description of changes
- Link to related issues
- Screenshots (if applicable)

### Development Guidelines

- **Code Style**: Follow PEP 8 and use Black formatter
- **Commit Messages**: Use conventional commit format
- **Testing**: Maintain >90% test coverage
- **Documentation**: Update docs for new features
- **Security**: Never commit secrets or credentials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:

- **Issues**: [GitHub Issues](https://github.com/MaiyoDenis/laundryconnect-fullstack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MaiyoDenis/laundryconnect-fullstack/discussions)
- **Email**: support@laundryconnect.com

## 🙏 Acknowledgments

- FastAPI team for the amazing framework
- Pydantic team for excellent data validation
- Contributors and beta testers
- Open source community

---

**Made with ❤️ by the LaundryConnect Team**

---

*For more detailed documentation, visit our [Wiki](https://github.com/MaiyoDenis/laundryconnect-fullstack/wiki)*
