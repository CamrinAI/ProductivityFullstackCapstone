# Sonic Speedometer - Implementation & API Usage Guide

## 1. Quick Start

### Development Environment Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Edit .env with:
DATABASE_URL=postgresql://localhost/sonic_speedometer
SECRET_KEY=dev-secret-key
CARQUERY_BASE_URL=https://carqueryapi.com/api/0.3
MARKETCHECK_API_KEY=your_api_key_here
FLASK_PORT=5000

# Create PostgreSQL database
createdb sonic_speedometer

# Run the server
python run.py
```

Server starts at `http://localhost:5000`

---

## 2. API Usage Examples

### 2.1 Health Check

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "Sonic Speedometer & Market Battle Engine"
}
```

---

### 2.2 Monitor Management

#### Create a Monitor
```bash
curl -X POST http://localhost:5000/api/monitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API",
    "target_url": "https://api.example.com/v1/health",
    "region": "us-east",
    "interval_s": 60,
    "enabled": true
  }'
```

**Response:**
```json
{
  "message": "Monitor created successfully",
  "data": {
    "id": 1,
    "name": "Production API",
    "target_url": "https://api.example.com/v1/health",
    "region": "us-east",
    "interval_s": 60,
    "enabled": true,
    "created_at": "2024-01-20T10:30:00",
    "updated_at": "2024-01-20T10:30:00",
    "latest_result": null
  }
}
```

#### List Monitors
```bash
curl http://localhost:5000/api/monitors
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Production API",
      "target_url": "https://api.example.com/v1/health",
      "latest_result": {
        "id": 42,
        "latency_ms": 145.32,
        "status_tier": "knuckles",
        "checked_at": "2024-01-20T10:35:00",
        "http_status": 200
      }
    }
  ],
  "count": 1
}
```

#### Run Manual Monitor Ping
```bash
curl -X POST http://localhost:5000/api/monitors/1/run
```

**Response:**
```json
{
  "message": "Monitor ping completed",
  "data": {
    "id": 43,
    "monitor_id": 1,
    "latency_ms": 87.56,
    "status_tier": "sonic",
    "checked_at": "2024-01-20T10:40:00",
    "http_status": 200,
    "error_message": null
  }
}
```

#### Get Latest Result
```bash
curl http://localhost:5000/api/monitors/1/results/latest
```

#### Get Result History with Pagination
```bash
curl "http://localhost:5000/api/monitors/1/results/history?page=1&per_page=20"
```

**Response:**
```json
{
  "data": [
    {
      "id": 43,
      "monitor_id": 1,
      "latency_ms": 87.56,
      "status_tier": "sonic",
      "checked_at": "2024-01-20T10:40:00",
      "http_status": 200,
      "error_message": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 43,
    "pages": 3
  }
}
```

#### Update Monitor
```bash
curl -X PUT http://localhost:5000/api/monitors/1 \
  -H "Content-Type: application/json" \
  -d '{
    "interval_s": 30,
    "enabled": false
  }'
```

#### Delete Monitor
```bash
curl -X DELETE http://localhost:5000/api/monitors/1
```

---

### 2.3 Car Battle Engine

#### Start a Car Battle
```bash
curl -X POST http://localhost:5000/api/cars/compare \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Response:**
```json
{
  "message": "Car battle completed",
  "comparison_id": 5,
  "data": {
    "car1": {
      "make": "Chevrolet",
      "model": "Corvette",
      "year": 2023,
      "specs": {
        "success": true,
        "make": "Chevrolet",
        "model": "Corvette",
        "year": 2023,
        "horsepower": "495 hp",
        "zero_to_sixty_s": "3.0",
        "torque_lbft": "470"
      },
      "pricing": {
        "success": true,
        "fair_market_value": 67450,
        "zip_code": "75146"
      }
    },
    "car2": { ... },
    "scorecard": {
      "horsepower": "Corvette wins",
      "value": "Mustang wins"
    },
    "winner": {
      "car": "Corvette",
      "score1": 1,
      "score2": 1
    }
  }
}
```

#### Get Past Comparisons
```bash
curl http://localhost:5000/api/cars/comparisons
```

---

### 2.4 Product Comparison (Placeholder)

#### Search Products
```bash
curl "http://localhost:5000/api/products/search?q=laptop&limit=10"
```

#### Compare Products
```bash
curl -X POST http://localhost:5000/api/products/compare \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": ["prod_123", "prod_456", "prod_789"]
  }'
```

---

## 3. Status Tier Mapping

### Latency Thresholds

| Tier | Latency | Character | Status | Icon |
|------|---------|-----------|--------|------|
| **Sonic** | < 50ms | Sonic | Super Fast | 🚀 |
| **Knuckles** | 100-300ms | Knuckles | Solid | ⚡ |
| **Eggman** | > 500ms | Eggman | Danger | 🚨 |

### Frontend GIF Integration

```jsx
const tierIcons = {
  sonic: {
    gif: 'https://media.giphy.com/media/13HxB5xto0MmIE/giphy.gif', // Sonic running
    label: 'Gotta Go Fast',
    color: 'green'
  },
  knuckles: {
    gif: 'https://media.giphy.com/media/l0ExayQDzrI2xOb8M/giphy.gif', // Knuckles gliding
    label: 'Power Punch',
    color: 'yellow'
  },
  eggman: {
    gif: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Eggman fleeing
    label: 'Danger Zone',
    color: 'red'
  }
};

function SpeedometerTier({ latency, tier }) {
  const tierData = tierIcons[tier];
  return (
    <div className={`p-4 rounded-lg bg-${tierData.color}-100`}>
      <img src={tierData.gif} alt={tier} className="w-24 h-24" />
      <p className="text-lg font-bold">{latency}ms</p>
      <p className="text-sm">{tierData.label}</p>
    </div>
  );
}
```

---

## 4. Service Architecture

### Monitor Service (Latency Pinging)

```python
from app.services import MonitorService
import asyncio

# Create service instance
service = MonitorService(timeout=5)

# Async ping a URL
async def test_ping():
    result = await service.ping_url('https://example.com')
    print(result)
    # {
    #   'latency_ms': 145.32,
    #   'status_tier': 'knuckles',
    #   'http_status': 200,
    #   'error': None
    # }

asyncio.run(test_ping())
```

### Car Battle Service

```python
from app.services import CarBattleService

# Run a car comparison
result = CarBattleService.compare_cars(
    'Chevrolet', 'Corvette', 2023,
    'Ford', 'Mustang', 2023,
    zip_code='75146'
)

print(result['winner'])
# {'car': 'Chevrolet Corvette', 'score1': 1, 'score2': 1}
```

### CarQuery Integration

```python
from app.services import CarQueryService

specs = CarQueryService.get_specs('Chevrolet', 'Corvette', 2023)
# {
#   'success': True,
#   'horsepower': '495 hp',
#   'zero_to_sixty_s': '3.0',
#   'torque_lbft': '470'
# }
```

### MarketCheck Integration

```python
from app.services import MarketCheckService

price = MarketCheckService.get_market_price('Ford', 'Mustang', 2023, '75146')
# {
#   'success': True,
#   'fair_market_value': 45000,
#   'zip_code': '75146'
# }
```

---

## 5. Error Handling Examples

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/monitors \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

**Response (400):**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields: name, target_url"
  }
}
```

### Resource Not Found
```bash
curl http://localhost:5000/api/monitors/999
```

**Response (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Monitor with ID 999 not found"
  }
}
```

### Unauthorized Access
```bash
curl http://localhost:5000/api/monitors \
  -b "session_id=invalid"
```

**Response (401):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Ownership Violation
```bash
curl http://localhost:5000/api/monitors/1 \
  -b "session_id=user_2_session"
```

**Response (403):**
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this monitor"
  }
}
```

---

## 6. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Monitors Table
```sql
CREATE TABLE monitors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  target_url VARCHAR(500) NOT NULL,
  region VARCHAR(50) DEFAULT 'us-east',
  interval_s INTEGER DEFAULT 60,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);
```

### Monitor Results Table
```sql
CREATE TABLE monitor_results (
  id SERIAL PRIMARY KEY,
  monitor_id INTEGER NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  latency_ms FLOAT NOT NULL,
  status_tier VARCHAR(20) NOT NULL,
  http_status INTEGER,
  error_message VARCHAR(255),
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(monitor_id, checked_at)
);
```

### Comparisons Table
```sql
CREATE TABLE comparisons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comparison_type VARCHAR(50) NOT NULL,
  item1_id VARCHAR(500),
  item2_id VARCHAR(500),
  winner VARCHAR(500),
  data_payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Flask Shell Commands (Development)

```bash
# Start Flask shell
flask shell

# Create all tables
>>> from app import db
>>> db.create_all()

# Create test user
>>> from app.models import User
>>> user = User(username='test', email='test@example.com', password_hash='hashed_pwd')
>>> db.session.add(user)
>>> db.session.commit()

# Query monitors
>>> from app.models import Monitor
>>> Monitor.query.all()

# Query results
>>> from app.models import MonitorResult
>>> MonitorResult.query.filter_by(monitor_id=1).all()
```

---

## 8. Performance Optimization Tips

1. **Pagination**: Always paginate result history
   ```python
   MonitorResult.query.paginate(page=1, per_page=50)
   ```

2. **Caching**: Cache API responses
   ```python
   from flask_caching import Cache
   cache = Cache(app, config={'CACHE_TYPE': 'redis'})
   ```

3. **Connection Pooling**: Use SQLAlchemy connection pools
   ```python
   SQLALCHEMY_ENGINE_OPTIONS = {
       'pool_pre_ping': True,
       'pool_recycle': 3600,
   }
   ```

4. **Async Operations**: Use httpx for concurrent requests
   ```python
   async with httpx.AsyncClient() as client:
       responses = await asyncio.gather(*tasks)
   ```

---

## 9. Testing Examples

```python
# test_monitors.py
import pytest
from app import create_app, db
from app.models import User, Monitor

@pytest.fixture
def client():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_list_monitors(client):
    # Create test user
    user = User(username='test', email='test@test.com', password_hash='hash')
    db.session.add(user)
    db.session.commit()
    
    # Create test monitor
    monitor = Monitor(
        user_id=user.id,
        name='Test Monitor',
        target_url='https://example.com'
    )
    db.session.add(monitor)
    db.session.commit()
    
    # Test endpoint
    response = client.get('/api/monitors', headers={'Authorization': 'Bearer token'})
    assert response.status_code == 200
    assert len(response.json['data']) == 1
```

---

## 10. Environment Variables Reference

```bash
# Flask Configuration
FLASK_ENV=development|production|testing
FLASK_APP=app.main:create_app
FLASK_PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost/sonic_speedometer

# Security
SECRET_KEY=your-secret-key-change-in-production
SESSION_COOKIE_SECURE=False  # Set to True in production

# External APIs
CARQUERY_BASE_URL=https://carqueryapi.com/api/0.3
MARKETCHECK_API_KEY=your_marketcheck_api_key
GOOGLE_MERCHANT_CREDENTIALS_JSON={}  # Full JSON credentials

# Logging
LOG_LEVEL=INFO|DEBUG|WARNING|ERROR

# API Configuration
API_TIMEOUT=10
MONITOR_PING_TIMEOUT=5
```

---

## 11. Deployment Checklist

- [ ] Configure PostgreSQL production database
- [ ] Set strong `SECRET_KEY`
- [ ] Enable `SESSION_COOKIE_SECURE=True`
- [ ] Set `FLASK_ENV=production`
- [ ] Configure API keys (CarQuery, MarketCheck, Google)
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for frontend domain
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Set up rate limiting
- [ ] Enable database indexing on frequently queried columns
- [ ] Configure Gunicorn or similar WSGI server
