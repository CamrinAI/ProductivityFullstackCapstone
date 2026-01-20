# Project Structure & Architecture Overview

## Complete Directory Tree

```
ProductivityFullstackCapstone/
├── README.MD                           # Original project pitch
├── BACKEND.md                          # Backend architecture & models
├── IMPLEMENTATION_GUIDE.md             # API usage guide & examples
│
├── backend/
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Environment template
│   ├── run.py                          # Development server entry
│   │
│   └── app/
│       ├── __init__.py                 # Flask app factory & extensions
│       ├── config.py                   # Configuration (dev/test/prod)
│       ├── main.py                     # Entry point
│       │
│       ├── models/
│       │   └── __init__.py             # SQLAlchemy models:
│       │                               #   - User
│       │                               #   - Monitor
│       │                               #   - MonitorResult
│       │                               #   - StatusTier (enum)
│       │                               #   - Comparison
│       │
│       ├── routes/
│       │   ├── __init__.py             # Blueprint exports
│       │   ├── health_routes.py        # GET /api/health, /api/status
│       │   ├── monitors_routes.py      # Monitor CRUD + latency speedometer
│       │   │                           #   - CRUD: GET/POST/PUT/DELETE
│       │   │                           #   - Ping: POST /{id}/run
│       │   │                           #   - History: GET /{id}/results/*
│       │   ├── cars_routes.py          # Car battle engine
│       │   │                           #   - POST /compare
│       │   │                           #   - GET /comparisons
│       │   └── products_routes.py      # Product comparison (skeleton)
│       │                               #   - GET /search
│       │                               #   - POST /compare
│       │
│       ├── services/
│       │   ├── __init__.py             # Service exports
│       │   ├── monitor_service.py      # Async latency pinging
│       │   │                           #   - ping_url()
│       │   │                           #   - create_monitor_result()
│       │   ├── car_battle_service.py   # CarQuery + MarketCheck
│       │   │                           #   - CarQueryService
│       │   │                           #   - MarketCheckService
│       │   │                           #   - CarBattleService
│       │   └── merchant_service.py     # Google Merchant Center (skeleton)
│       │                               #   - MerchantCenterService
│       │
│       └── utils/
│           ├── __init__.py             # Utility functions
│           └── error_handler.py        # Global error handling
│                                       #   - APIError (custom exception)
│                                       #   - NotFoundError (404)
│                                       #   - UnauthorizedError (401)
│                                       #   - ForbiddenError (403)
│                                       #   - ValidationError (400)
│                                       #   - TimeoutError (504)
│                                       #   - register_error_handlers()
│
├── frontend/ (Coming Soon)
│   └── src/
│       ├── components/
│       │   ├── SpeedometerDashboard.jsx
│       │   ├── MonitorCard.jsx
│       │   ├── CarBattleArena.jsx
│       │   └── ProductComparison.jsx
│       │
│       └── pages/
│           ├── Dashboard.jsx
│           ├── MonitorDetail.jsx
│           ├── CarBattle.jsx
│           └── ProductComparison.jsx
│
└── docs/
    ├── API_REFERENCE.md                # Complete API documentation
    ├── DEPLOYMENT.md                   # Deployment guide
    └── TESTING.md                      # Testing strategy
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       SONIC SPEEDOMETER                         │
│                   Full-Stack Application                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SpeedometerDashboard │ CarBattleArena │ ProductComparison │ │
│  │                                                             │ │
│  │  - Optimistic UI Updates                                   │ │
│  │  - Real-time Status Display (Sonic/Knuckles/Eggman)      │ │
│  │  - Loading States                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                    │
│                    HTTP Client (axios)                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────────────────────┐
              │  Global Error Handler       │
              │  - 404 Not Found            │
              │  - 401 Unauthorized         │
              │  - 403 Forbidden            │
              │  - 500 Server Error         │
              │  - 504 Timeout              │
              └─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Flask)                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Route Layer                          │  │
│  │  ┌─────────┬──────────┬────────┬──────────┐            │  │
│  │  │ Health  │ Monitors │ Cars   │ Products │            │  │
│  │  └─────────┴──────────┴────────┴──────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                         │  │
│  │  ┌────────────┬──────────────┬─────────────┐           │  │
│  │  │ Monitor    │ Car Battle   │ Merchant    │           │  │
│  │  │ Service    │ Service      │ Service     │           │  │
│  │  └────────────┴──────────────┴─────────────┘           │  │
│  │                                                         │  │
│  │  - Async Latency Pinging                               │  │
│  │  - External API Integration                            │  │
│  │  - Business Logic                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Database Layer                          │  │
│  │  SQLAlchemy ORM                                         │  │
│  │  ┌─────────┬────────┬──────────────┬────────────┐     │  │
│  │  │ Users   │Monitor │ MonitorResult│ Comparison │     │  │
│  │  │         │        │              │            │     │  │
│  │  └─────────┴────────┴──────────────┴────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                            │
│  - Relational data with ownership enforcement                   │
│  - Transaction support                                          │
│  - Indexing on frequently queried columns                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────────────────────┐
            │   External API Integrations   │
            ├───────────────────────────────┤
            │  CarQuery API                 │
            │  ├── /getSpecs                │
            │  └── Spec data (HP, 0-60)     │
            │                               │
            │  MarketCheck API              │
            │  ├── /v2/.../marketcheck_price
            │  └── Fair Market Value (ZIP)  │
            │                               │
            │  Google Merchant Center       │
            │  ├── Content API              │
            │  └── PriceCompetitiveness     │
            └───────────────────────────────┘
```

---

## Data Flow: Monitor Latency Speedometer

```
User Creates Monitor
        ↓
POST /api/monitors
        ↓
    Route Handler
    - Validate input
    - Check ownership
    - Create Monitor object
        ↓
SQLAlchemy ORM
    - Save to database
    - Assign ID & timestamps
        ↓
Monitor Created Successfully
        ↓
POST /api/monitors/{id}/run (Manual Ping)
        ↓
    Route Handler
    - Check authentication
    - Verify ownership
        ↓
    MonitorService.ping_url()
    - Async HTTP GET
    - Measure latency
    - Determine tier: SONIC/KNUCKLES/EGGMAN
        ↓
        Latency < 50ms     → SONIC (🚀 Super Fast)
        Latency 100-300ms  → KNUCKLES (⚡ Solid)
        Latency > 500ms    → EGGMAN (🚨 Danger)
        ↓
    MonitorService.create_monitor_result()
    - Create MonitorResult object
        ↓
SQLAlchemy ORM
    - Save to database
    - Store: latency_ms, status_tier, checked_at, http_status
        ↓
GET /api/monitors/{id}/results/latest
        ↓
Return Latest MonitorResult
    - Status tier display
    - Latency value
    - Timestamp
    - HTTP status
        ↓
Frontend
    - Display GIF based on tier
    - Show latency in ms
    - Update dashboard UI
        ↓
GET /api/monitors/{id}/results/history
        ↓
Return Paginated History
    - All historical results
    - Pagination metadata
        ↓
Frontend
    - Display time-series chart
    - Show trends
    - Identify patterns
```

---

## Data Flow: Car Battle Engine

```
User Selects Car Battle
        ↓
POST /api/cars/compare
{
  "car1": {make, model, year},
  "car2": {make, model, year},
  "zip_code": "75146"
}
        ↓
    CarBattleService.compare_cars()
        ↓
    ┌─────────────────────────────────┐
    │  CarQueryService.get_specs()    │
    │  ├─ Make: Chevrolet             │
    │  ├─ Model: Corvette             │
    │  └─ Year: 2023                  │
    │      ↓                          │
    │  GET /getSpecs                  │
    │      ↓                          │
    │  Parse Response                 │
    │  ├─ Horsepower: 495 hp          │
    │  ├─ 0-60: 3.0 seconds           │
    │  └─ Torque: 470 lb-ft           │
    └─────────────────────────────────┘
        ↓
    ┌──────────────────────────────────────────┐
    │  MarketCheckService.get_market_price()   │
    │  ├─ Make: Chevrolet                      │
    │  ├─ Model: Corvette                      │
    │  ├─ Year: 2023                           │
    │  └─ ZIP: 75146 (Lancaster, TX)           │
    │      ↓                                   │
    │  GET /v2/.../marketcheck_price           │
    │      ↓                                   │
    │  Parse Response                          │
    │  └─ Fair Market Value: $67,450           │
    └──────────────────────────────────────────┘
        ↓
    Repeat for Car 2 (Ford Mustang)
        ↓
    ┌──────────────────────────────────────┐
    │  Scoring Logic                       │
    │  ├─ Compare specs                    │
    │  │  └─ Horsepower winner?            │
    │  ├─ Compare pricing                  │
    │  │  └─ Best value?                   │
    │  └─ Calculate winner                 │
    │     └─ Car with most points          │
    └──────────────────────────────────────┘
        ↓
    Save Comparison to Database
    ├─ User ID
    ├─ Type: "car"
    ├─ Winner
    └─ Full payload JSON
        ↓
Return Battle Results
    ├─ Car 1 specs & pricing
    ├─ Car 2 specs & pricing
    ├─ Scorecard
    └─ Winner announcement
        ↓
Frontend
    ├─ Display side-by-side comparison
    ├─ Highlight winner
    ├─ Show spec differences
    └─ Display pricing in market
```

---

## Key Design Patterns

### 1. Factory Pattern (Flask App)
```python
# Create app factory for testing and production
def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    # Initialize extensions...
    return app
```

### 2. Service Layer Pattern (Business Logic)
```python
# Separate API integration from routes
class CarBattleService:
    @staticmethod
    def compare_cars(...):
        # Orchestrate multiple API calls
        # Apply business logic
        # Return results
```

### 3. Global Error Handler Pattern
```python
# Centralized error handling
@app.errorhandler(APIError)
def handle_api_error(error):
    # Standardized error response format
```

### 4. Ownership Enforcement Pattern
```python
# Verify user owns resource before access
def check_monitor_ownership(monitor, user_id):
    if monitor.user_id != user_id:
        raise ForbiddenError(...)
```

### 5. Async Pattern (Non-blocking I/O)
```python
# Use asyncio for concurrent HTTP requests
async def ping_url(url):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return result
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────┐
│                User (Auth Owner)                        │
└────────────┬────────────────────────────────────────────┘
             │
             ├─ 1:N → Monitors
             │        ├─ 1:N → MonitorResults
             │        │        └─ latency_ms, status_tier
             │        └─ Properties: name, target_url, region
             │
             └─ 1:N → Comparisons
                      ├─ type: 'car' or 'product'
                      ├─ item1_id, item2_id
                      ├─ winner
                      └─ data_payload (JSON)
```

---

## Security Architecture

### Authentication
- Session-based authentication
- `user_id` stored in Flask session
- Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax`

### Authorization
- Ownership checks on all resource access
- Users can only access their own monitors/comparisons
- Enforced at route handler level

### API Security
- CORS configured for frontend domain
- Input validation on all endpoints
- SQL injection prevention (SQLAlchemy ORM)
- Timeout protection (5-10 second timeouts)

### Error Security
- Generic error messages (no stack traces to client)
- Proper HTTP status codes
- Logging of detailed errors server-side

---

## Performance Optimizations

### Database
- Indexes on `user_id`, `monitor_id`, `checked_at`
- Pagination for large result sets
- Connection pooling with SQLAlchemy

### API Calls
- Async HTTP requests (non-blocking)
- Configurable timeouts
- Backoff/retry logic (future enhancement)

### Caching
- Redis caching layer (future enhancement)
- API response caching
- Session management optimization

---

## Testing Strategy

```
Test Pyramid:
             /\
            /  \  E2E Tests (Selenium)
           /────\
          /      \ Integration Tests (Flask client)
         /────────\
        /          \ Unit Tests (models, services)
       /────────────\

Coverage Target: 80%+
- Models: 100%
- Routes: 90%
- Services: 85%
- Utils: 80%
```

---

## Deployment Architecture

```
Production Environment:
┌───────────────────────────────────────┐
│  Load Balancer (nginx/ALB)            │
└───────────┬─────────────────────────┬─┘
            │                         │
     ┌──────▼──────┐          ┌──────▼──────┐
     │ Flask App   │          │ Flask App   │
     │ (Gunicorn)  │          │ (Gunicorn)  │
     │ Port 8000   │          │ Port 8001   │
     └──────┬──────┘          └──────┬──────┘
            │                         │
     ┌──────▼─────────────────────────▼──────┐
     │   PostgreSQL Database (Primary)       │
     │   - Replication to standby            │
     │   - Automated backups                 │
     │   - Connection pooling                │
     └───────────────────────────────────────┘
            │
     ┌──────▼──────────┐
     │ Redis Cache    │
     │ (Session store)│
     └────────────────┘
```

---

## Future Enhancements

- [ ] Background tasks (APScheduler)
- [ ] WebSocket real-time updates
- [ ] Advanced charting (Chart.js)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] API rate limiting
- [ ] Advanced caching strategy
- [ ] Database replication
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline (GitHub Actions)
