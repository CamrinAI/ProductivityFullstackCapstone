# Sonic Speedometer & Market Battle Engine

## Project Overview

A full-stack productivity application that combines three powerful features:

1. **Latency Speedometer**: Monitor and diagnose slow APIs with real-time latency tracking using Sonic character status tiers
2. **Car Battle Engine**: Compare vehicles head-to-head using technical specs and localized market pricing
3. **Merchant Product Comparison**: Aggregate and compare retail products across merchants with price competitiveness insights

---

## Tech Stack

### Backend
- **Framework**: Flask with Flask-SQLAlchemy
- **Database**: PostgreSQL
- **Authentication**: Session-based with ownership enforcement
- **Async**: httpx for async HTTP requests
- **Scheduling**: APScheduler (for background monitor tasks)
- **Testing**: pytest with fixtures and mocking

### Frontend (Coming Soon)
- **Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useContext)
- **Routing**: React Router v6

---

## Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuration (dev, test, prod)
│   ├── main.py                  # Entry point
│   ├── models/
│   │   └── __init__.py          # SQLAlchemy models (User, Monitor, MonitorResult, Comparison)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health_routes.py     # Health/status endpoints
│   │   ├── monitors_routes.py   # Monitor CRUD and latency speedometer
│   │   ├── cars_routes.py       # Car battle endpoints
│   │   └── products_routes.py   # Product comparison endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── monitor_service.py   # Async latency pinging
│   │   ├── car_battle_service.py # CarQuery + MarketCheck integration
│   │   └── merchant_service.py  # Google Merchant Center integration
│   └── utils/
│       ├── __init__.py
│       └── error_handler.py     # Global error handling + custom exceptions
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── run.py                       # Development server entry point

frontend/
├── src/
│   ├── components/              # Reusable React components
│   ├── pages/                   # Page components
│   └── ...
```

---

## Database Models

### User
Stores user authentication and ownership data.

```python
User
├── id (PK)
├── username (unique)
├── email (unique)
├── password_hash
├── created_at
├── updated_at
└── relationships: monitors, comparisons
```

### Monitor
Service endpoints to monitor for latency.

```python
Monitor
├── id (PK)
├── user_id (FK)
├── name
├── target_url
├── region
├── interval_s
├── enabled
├── created_at
├── updated_at
└── relationships: results
```

### MonitorResult
Historical latency measurements with tier classification.

```python
MonitorResult
├── id (PK)
├── monitor_id (FK)
├── latency_ms
├── status_tier (sonic | knuckles | eggman)
├── http_status
├── error_message
└── checked_at

Status Tiers:
- SONIC (<50ms):      Gotta Go Fast - Super Fast ✓
- KNUCKLES (100-300ms): Power Punch - Solid ⚡
- EGGMAN (>500ms):    Evil Laugh - Danger 🚨
```

### Comparison
Stores car battles and product comparisons.

```python
Comparison
├── id (PK)
├── user_id (FK)
├── comparison_type (car | product)
├── item1_id
├── item2_id
├── winner
├── data_payload (JSON)
├── created_at
└── updated_at
```

---

## API Endpoints

### Health & Status
- `GET /api/health` - Health check
- `GET /api/status` - Service status

### Monitors (Latency Speedometer)
- `GET /api/monitors` - List all user monitors
- `POST /api/monitors` - Create new monitor
- `GET /api/monitors/{id}` - Get monitor details
- `PUT /api/monitors/{id}` - Update monitor
- `DELETE /api/monitors/{id}` - Delete monitor
- `POST /api/monitors/{id}/run` - Manual ping
- `GET /api/monitors/{id}/results/latest` - Latest result
- `GET /api/monitors/{id}/results/history` - Result history with pagination

**Example: Create Monitor**
```json
POST /api/monitors
{
  "name": "API Service",
  "target_url": "https://api.example.com/health",
  "region": "us-east",
  "interval_s": 60,
  "enabled": true
}
```

### Cars (Car Battle Engine)
- `POST /api/cars/compare` - Run car battle
- `GET /api/cars/comparisons` - Get past comparisons

**Example: Compare Cars**
```json
POST /api/cars/compare
{
  "car1": {
    "make": "Chevrolet",
    "model": "Corvette",
    "year": 2023
  },
  "car2": {
    "make": "Ford",
    "model": "Mustang",
    "year": 2023
  },
  "zip_code": "75146"
}
```

**Response:**
```json
{
  "car1": {
    "specs": { "horsepower": "495 hp", "0-60": "3.0s" },
    "pricing": { "fair_market_value": 67000 }
  },
  "car2": { ... },
  "scorecard": { "horsepower": "Corvette wins", "value": "Mustang wins" },
  "winner": { "car": "Corvette", "score1": 1, "score2": 1 }
}
```

### Products (Merchant Comparison)
- `GET /api/products/search?q=<query>&limit=10` - Search products
- `GET /api/products/{id}` - Product details
- `POST /api/products/compare` - Compare products

---

## External API Integrations

### 1. CarQuery API
**Endpoint**: `/getSpecs`

Fetches technical specifications for vehicles:
- Horsepower
- 0-60 time
- Torque
- Engine displacement

**Service**: `CarQueryService.get_specs(make, model, year)`

### 2. MarketCheck API
**Endpoint**: `/v2/predict/car/us/marketcheck_price`

Provides localized fair market value for vehicles:
- Fair Market Value (FMV)
- Regional pricing data
- ZIP code specific pricing

**Service**: `MarketCheckService.get_market_price(make, model, year, zip_code)`

### 3. Google Merchant Center Content API
**Feature**: PriceCompetitivenessProductView (Beta)

Ingests and compares retail products:
- Price competitiveness
- Availability
- Ratings
- Merchant information

**Service**: `MerchantCenterService` (setup pending credentials)

---

## Error Handling

Global error handler catches:
- **404 Not Found**: Resource doesn't exist
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **504 Timeout**: API request timeout
- **500 Internal Server Error**: Unhandled exceptions

**Error Response Format:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": {}
  }
}
```

---

## Authentication & Authorization

- **Type**: Session-based authentication
- **Ownership**: All resources enforce user ownership
- **Example**: Users can only access their own monitors and comparisons

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- PostgreSQL 12+
- pip or poetry

### Installation Steps

1. **Clone the repository**
```bash
cd ProductivityFullstackCapstone/backend
```

2. **Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

5. **Initialize database**
```bash
flask db upgrade  # When migrations are set up
# Or create tables via Flask shell:
# python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

6. **Run development server**
```bash
python run.py
# Server runs on http://localhost:5000
```

---

## Development Workflow

### Adding a New Route

1. Create handler in `app/routes/`
2. Use `require_auth()` for protected endpoints
3. Use custom exceptions from `error_handler.py`
4. Return JSON responses with proper status codes

### Adding a New Service

1. Create service file in `app/services/`
2. Import in `app/services/__init__.py`
3. Use in routes via dependency

### Adding a New Model

1. Define in `app/models/__init__.py`
2. Include `to_dict()` method for serialization
3. Run migration (Alembic setup pending)

---

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest app/routes/test_monitors.py

# Run with coverage
pytest --cov=app
```

---

## Deployment

### Production Configuration

Set environment variables:
```bash
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:pass@db.example.com/sonic_speedometer
export SECRET_KEY=<secure-random-key>
export CARQUERY_BASE_URL=https://carqueryapi.com/api/0.3
export MARKETCHECK_API_KEY=<your-key>
```

### Run with Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

---

## Key Features Implemented

✅ **Flask Application Factory** - Clean, modular initialization
✅ **SQLAlchemy Models** - Relational database with ownership
✅ **Session Authentication** - Built-in Flask session management
✅ **Async Latency Monitoring** - Non-blocking HTTP pings
✅ **Global Error Handler** - Standardized error responses
✅ **Services Layer** - Refactored API integration
✅ **CRUD Routes** - Complete monitor lifecycle management
✅ **Status Tier Mapping** - Sonic/Knuckles/Eggman classification

---

## Next Steps

1. **Frontend Setup** - React dashboard with optimistic UI updates
2. **Background Tasks** - APScheduler for recurring monitor checks
3. **Authentication** - User registration/login endpoints
4. **Testing** - pytest fixtures and mock external APIs
5. **Merchant Integration** - Full Google Merchant Center setup
6. **Caching** - Redis for rate limiting and data caching
7. **Logging** - Structured logging and monitoring
8. **Deployment** - Docker containerization and CI/CD

---

## Notes for Developers

- All routes require authentication (session-based)
- Ownership checks prevent cross-user data access
- Async operations use `asyncio` for non-blocking calls
- External API timeouts fall back to error responses
- Database models include timestamp tracking (created_at, updated_at)
