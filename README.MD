# Trade-Tracker AI - Asset Management System

Professional full-stack asset management platform for electricians, plumbers, and trade contractors.

## 🎯 Features

- **Asset Tracking**: Monitor tools and equipment with QR codes
- **Voice-to-Inventory**: Update inventory using voice commands (OpenAI Whisper + GPT-4o)
- **Sonic Tier System**: Visual status indicators (Sonic/Tails/Eggman)
- **Location-Based Alerts**: Get alerted when assets are far from job site
- **Material Management**: Track consumables with min-stock levels
- **Checkout/Checkin Logs**: Full audit trail for all asset movements
- **Auth Guard**: Header-based user identity (`X-User-ID`) with optional bearer token (`Authorization: Bearer <token>`) to protect owner-only routes
- **Geofencing (planned)**: Compare navigator.geolocation to stored job_site coords to trigger alerts when outside permitted radius

## 🛠 Tech Stack

**Backend**: Flask + Flask-SQLAlchemy + PostgreSQL  
**Frontend**: React.js + Tailwind CSS  
**AI**: OpenAI Whisper (transcription) + GPT-4o (parsing)  
**QR**: qrcode (generation) + html5-qrcode (scanning)  
**Database**: PostgreSQL (production) / SQLite (dev)

## 📋 Project Structure

```
ProductivityFullstackCapstone/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask factory
│   │   ├── config.py            # Environment config
│   │   ├── models/
│   │   │   └── __init__.py      # SQLAlchemy models
│   │   ├── routes/
│   │   │   ├── assets_routes.py # Asset CRUD
│   │   │   └── voice_routes.py  # Voice-to-inventory
│   │   ├── services/
│   │   │   └── voice_service.py # OpenAI integration
│   │   └── utils/
│   │       └── error_handler.py # Global error handling
│   ├── run.py                   # Entry point
│   ├── requirements.txt         # Python dependencies
│   └── .venv/                   # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app
│   │   ├── components/
│   │   │   ├── AssetCard.jsx
│   │   │   ├── VoiceRecorder.jsx
│   │   │   └── QRScanner.jsx
│   │   └── index.css            # Tailwind styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# first-time DB setup (Flask-Migrate)
FLASK_APP=app:create_app FLASK_ENV=development flask db upgrade

# run server
python run.py
```

Server runs on http://localhost:3000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:5173

### Environment Variables
- **API Routes**

| Method | Path | Headers | Body | Notes |
| --- | --- | --- | --- | --- |
| GET | /api/assets?page=&per_page= | X-User-ID, [Authorization Bearer optional] | - | Paginated list of user-owned assets |
| POST | /api/assets | X-User-ID | `{ "name", "asset_type?", "description?", "location?", "serial_number?" }` | Creates asset with unique serial (if provided) |
| POST | /api/assets/<id>/checkout | X-User-ID | `{ "location": "Job Site" }` | Marks asset checked out, logs location |
| POST | /api/assets/<id>/checkin | X-User-ID | `{ "location": "Warehouse" }` | Marks asset checked in |
| GET | /api/assets/<id>/qr | X-User-ID | - | Downloads QR PNG for asset |
| POST | /api/assets/<id>/serial | X-User-ID | `{ "serial_number": "ABC-123" }` | Updates/sets serial number (unique) |
| GET | /api/assets/materials | X-User-ID | - | Lists materials |
| POST | /api/assets/materials | X-User-ID | `{ "name", "unit?", "quantity?", "min_stock?" }` | Creates material |
| POST | /api/voice/update | X-User-ID + multipart/form-data | `audio` file | Voice-to-inventory update (Whisper + GPT-4o) |

Create `.env` in backend/:

```
FLASK_ENV=development
DATABASE_URL=sqlite:///trade_tracker.db
OPENAI_API_KEY=sk-your-key
```

## 📊 Data Models

### User
```python
- id (PK)
- username (unique)
- email (unique)
- password_hash
- company (e.g., "ABC Electrical")
- role (technician/manager/admin)
```

### Asset
```python
- id (PK)
- owner_id (FK → User)
- name (e.g., "Milwaukee Drill Kit")
- asset_type (power_tool/hand_tool/safety_gear)
- qr_code (UUID)
- location (job site/warehouse/truck)
- status (sonic/tails/eggman)
- checkout_date (when last checked out)
- is_available (boolean)
```

### Material
```python
- id (PK)
- owner_id (FK → User)
- name (e.g., "12-2 Romex Cable")
- unit (spool/box/roll)
- quantity
- min_stock (reorder threshold)
```

### CheckoutLog
```python
- id (PK)
- asset_id (FK → Asset)
- user_id (FK → User)
- checkout_time
- checkin_time
- location_checkout
- location_checkin
- notes
```

## 🔊 Voice-to-Inventory API

**Endpoint**: `POST /api/voice/update`

**Request**:
```
Content-Type: multipart/form-data
Body: audio file + user_id
```

**Example**: "Add 5 spools of wire to warehouse"

**Response**:
```json
{
  "success": true,
  "item": "Romex Cable",
  "quantity": 5,
  "action": "add",
  "type": "material"
}
```

## 🎨 Sonic Tier System

| Tier | Color | Condition | Checkout Duration |
|------|-------|-----------|-------------------|
| SONIC | Blue | Good | < 7 days |
| TAILS | Yellow | Maintenance Due | 7-30 days |
| EGGMAN | Red | Missing/Damaged | > 30 days or reported |

## 🔐 Security Features

- Ownership enforcement on all resources
- User ID validation on every request
- Error handling with sanitized messages
- CORS enabled for frontend

## 📝 API Endpoints

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create asset
- `GET /api/assets/<id>` - Get asset details
- `PUT /api/assets/<id>` - Update asset
- `POST /api/assets/<id>/checkout` - Check out asset
- `POST /api/assets/<id>/checkin` - Check in asset
- `GET /api/assets/<id>/qr` - Download QR code
- `POST /api/assets/<id>/report-issue` - Report missing/damaged

### Materials
- `GET /api/assets/materials` - List materials
- `POST /api/assets/materials` - Create material
- `PUT /api/assets/materials/<id>` - Update quantity

### Voice
- `POST /api/voice/update` - Process audio and update inventory

## 🧪 Testing

### Quick Start
```bash
# Backend (new terminal)
cd backend
python3 run.py

# Frontend (new terminal)
cd frontend
npm run dev
```

### Curl Test Suite
A minimal script is available at `scripts/curl_tests.sh`.
```bash
bash scripts/curl_tests.sh
```
It will:
- Register two users and capture JWTs
- Create an asset for User A
- Attempt access with User B (expects 403/404)
- Create/update/delete material
- Verify pagination
- Delete asset

### Ownership Gate Manual Test
```bash
# Assume TOKEN_A (owner) and TOKEN_B (other user)
# Get asset by id (works for owner, fails for other)
curl -i http://localhost:3000/api/assets/<id> -H "Authorization: Bearer $TOKEN_A"
curl -i http://localhost:3000/api/assets/<id> -H "Authorization: Bearer $TOKEN_B"
```

### Sonic Tier Logic Check
- Set `checkout_date` > 30 days ago for an asset, refresh UI, expect Eggman badge.

### Pagination Verification
Open DevTools Network and confirm `/api/assets?page=1&per_page=10`.
Use Next/Previous buttons in the Assets tab.

## 📚 Key Implementation Notes

### Voice Processing Flow
1. User records audio via React VoiceRecorder
2. Audio sent to `/api/voice/update`
3. Flask calls OpenAI Whisper API for transcription
4. GPT-4o parses transcript into structured JSON
5. Backend updates database
6. Frontend refreshes UI

### QR Code Workflow
1. Generate QR code when asset created (unique UUID)
2. Print QR labels for physical tools
3. On-site: Scan QR with mobile browser
4. Triggers asset lookup and checkout/checkin
5. Location updated in real-time

### Sonic Tier Logic
```python
if checkout_date:
    days_checked_out = (today - checkout_date).days
    if days_checked_out < 7:
        status = "sonic"  # Blue
    elif days_checked_out < 30:
        status = "tails"  # Yellow
    else:
        status = "eggman"  # Red
```

## 🐛 Troubleshooting

**Flask server won't start**:
```bash
lsof -ti:3000 | xargs kill -9
python run.py
```

**Frontend can't reach backend**:
- Check CORS enabled in Flask
- Verify backend on localhost:3000
- Check browser console for errors

**Voice transcription failing**:
- Verify OPENAI_API_KEY in .env
- Check microphone permissions
- Ensure audio format is webm/wav

## 📄 License

MIT

## 👤 Author

Electrician turned Software Engineer
