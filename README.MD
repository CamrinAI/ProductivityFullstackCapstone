# Trade-Tracker AI

A full-stack asset and material management app for trade crews. Track tools, manage consumables, and see who is using what on site.

## ✅ Core Features
- **Authentication** (login/register) with role-based UI
- **Tools dashboard** with search, pagination, check-out/in, and status tags
- **Materials inventory** with add/remove quantities and low-stock alerts
- **Onsite view** that lists active checkouts as “Name Tool in use”
- **Admin actions** for creating tools and materials (UI-gated by role)

## 🧰 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Flask + SQLAlchemy
- **Database:** SQLite (dev)

## 🚀 Quick Start

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```
Runs at http://localhost:3000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at http://localhost:5173

## 🔐 Demo Accounts
- **Technician:** demo / demo123
- **Foreman:** foreman / foreman123
- **Superintendent:** super / super123

## 🧩 Roles & Permissions (UI)
- **Technician:** view tools, check out/in
- **Foreman:** technician + create/edit tools
- **Superintendent:** foreman + materials management

## 📦 Key API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/auth/users`

### Tools
- `GET /api/tools`
- `POST /api/tools`
- `PUT /api/tools/<id>`
- `DELETE /api/tools/<id>`
- `POST /api/tools/<id>/checkout`
- `POST /api/tools/<id>/checkin`
- `POST /api/tools/<id>/serial`

### Materials
- `GET /api/tools/materials`
- `POST /api/tools/materials`
- `PUT /api/tools/materials/<id>`
- `DELETE /api/tools/materials/<id>`

## 🧱 Data Model (Simplified)
- **User:** id, username, email, password_hash, role, company
- **Tool:** id, name, status, is_available, checked_out_by, checkout_date
- **Material:** id, name, unit, quantity, min_stock

## 📌 Project Structure (Key Files)
```
backend/
    app/
        routes/
            auth_routes.py
            tools_routes.py
        models/__init__.py
    run.py
frontend/
    src/
        App.jsx
        context/AuthContext.jsx
        components/
            AssetCard.jsx
            MaterialCard.jsx
            OnsiteList.jsx
            AddToolModal.jsx
            AddMaterialModal.jsx
```

## ✅ Rubric Mapping
- **Problem Solved:** Centralizes tool/material tracking for trade crews
- **Full-Stack:** React frontend + Flask backend + SQL database
- **CRUD:** Tools and Materials support full CRUD and inventory adjustments
- **Auth:** Secure login/register with protected routes
- **State & UX:** Sorted views, low-stock indicators, onsite status

## 📄 License
MIT
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

## � Future Improvements

### Multi-User Authentication & Role-Based Access
- **Worker accounts**: Basic asset checkout/checkin with limited permissions
- **Management accounts**: Full CRUD + analytics dashboard with elevated privileges
- **JWT token-based auth**: Secure session management with refresh tokens
- **Ownership enforcement**: Filter assets/materials by `owner_id` to ensure data isolation
- **Role gates**: Decorator-based route protection (`@manager_required`, `@worker_or_above`)
- **Team collaboration**: Share assets across organization with permission levels

### Additional Enhancements
- **Geofencing**: GPS-based alerts when assets leave job site radius
- **Mobile app**: Native iOS/Android with offline-first sync
- **Advanced analytics**: Cost tracking, utilization reports, depreciation calculations
- **Barcode scanner**: Alternative to QR codes for legacy equipment
- **Notification system**: Email/SMS alerts for missing assets or low stock

## �📄 License

MIT

## 👤 Author

Electrician turned Software Engineer
