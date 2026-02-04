# Authentication Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER AUTHENTICATION                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│   Browser    │────────▶│   Frontend   │────────▶│   Backend    │
│  (React UI)  │         │  (AuthContext)│         │ (Flask API)  │
│              │◀────────│              │◀────────│              │
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │                         │
      │                         │                         │
      ▼                         ▼                         ▼
 localStorage              React State              PostgreSQL DB
 (JWT Token)              (user, role)              (User table)


## Login Flow

1. USER ACTION: Enter username + password
   │
   ├──▶ 2. FRONTEND: Send POST /api/auth/login
   │         │
   │         └──▶ 3. BACKEND: Validate credentials
   │                    │
   │                    ├─ Check username exists
   │                    ├─ Verify password hash
   │                    └─ Generate JWT token
   │                          │
   │                          └──▶ 4. RESPONSE: {user, access_token}
   │                                    │
   └─────────────────────────────────── ┘
                                        │
5. FRONTEND: Save token to localStorage
   │
6. FRONTEND: Update AuthContext (user, token, role)
   │
7. APP: Render based on role
   │
   ├─ Technician: Basic view
   ├─ Foreman: + Tool management
   └─ Superintendent: + Full admin


## Role-Based Access Flow

┌────────────────┐
│  API REQUEST   │
└────────┬───────┘
         │
         ▼
┌────────────────────────┐
│  JWT Token in Header   │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Backend Middleware    │
│  @jwt_required()       │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Extract user_id       │
│  from token            │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Get User from DB      │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│  Check user.role       │
└────────┬───────────────┘
         │
         ├─── Allowed ────▶ Process Request ─▶ Return Data
         │
         └─── Denied ────▶ Return 403 Forbidden


## Role Permissions Matrix

┌──────────────────┬─────────────┬──────────┬─────────────────┐
│   OPERATION      │ TECHNICIAN  │ FOREMAN  │ SUPERINTENDENT  │
├──────────────────┼─────────────┼──────────┼─────────────────┤
│ View Tools       │     ✓       │    ✓     │       ✓         │
│ Check Out Tool   │     ✓       │    ✓     │       ✓         │
│ Create Tool      │     ✗       │    ✓     │       ✓         │
│ Edit Tool        │     ✗       │    ✓     │       ✓         │
│ Delete Tool      │     ✗       │    ✓     │       ✓         │
│ View Materials   │     ✓       │    ✓     │       ✓         │
│ Manage Materials │     ✗       │    ✗     │       ✓         │
│ View Reports     │     ✗       │    ✓     │       ✓         │
│ User Management  │     ✗       │    ✗     │       ✓         │
└──────────────────┴─────────────┴──────────┴─────────────────┘


## Component Hierarchy

App.jsx
├─ AuthContext (wraps entire app)
│   ├─ user: {id, username, role, email}
│   ├─ token: JWT string
│   ├─ login()
│   ├─ logout()
│   └─ register()
│
├─ LoginPage (if !user)
│   ├─ Login Form
│   └─ Signup Form (toggle)
│
└─ Dashboard (if user)
    ├─ Header
    │   ├─ Logo
    │   ├─ User Greeting ("Hello {username}")
    │   ├─ Role Badge (if foreman/super)
    │   ├─ Search Bar
    │   └─ Logout Button
    │
    ├─ Breadcrumbs (daisyUI)
    │
    ├─ Role Banner (if canManageTools)
    │
    ├─ Status Dashboard
    │
    ├─ Tools/Materials Tabs
    │
    ├─ Add Tool Button (if canManageTools)
    │
    └─ RoleSwitcher (testing only)


## Database Schema

┌─────────────────────────────────────┐
│             USERS TABLE             │
├─────────────────────────────────────┤
│ id (PK)                             │
│ username (unique, not null)         │
│ email (unique, not null)            │
│ password_hash (not null)            │
│ role (default: 'technician')        │
│   - technician                      │
│   - foreman                         │
│   - superintendent                  │
│ company (nullable)                  │
│ is_active (default: true)           │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘


## Security Layers

1. PASSWORD SECURITY
   └─ Werkzeug password hashing (PBKDF2)

2. TOKEN SECURITY
   └─ JWT with expiration (24h default)

3. API SECURITY
   ├─ @jwt_required() decorator
   └─ @require_role([...]) decorator

4. FRONTEND SECURITY
   ├─ Token stored in localStorage
   ├─ Conditional rendering based on role
   └─ Auto-logout on invalid token

5. VALIDATION
   ├─ Email format validation
   ├─ Password strength (implement if needed)
   └─ Username uniqueness check


## Token Structure

JWT Token Contents:
{
  "identity": user_id,      // User's database ID
  "iat": 1704374400,        // Issued at timestamp
  "exp": 1704460800,        // Expiration timestamp
  "type": "access"          // Token type
}

Note: Role is NOT in token, fetched from DB on each request
This allows role changes without re-login


## Testing Workflow

1. Seed Users
   └─ python seed_users.py

2. Start Servers
   ├─ Backend: python run.py (port 3000)
   └─ Frontend: npm run dev (port 5173)

3. Test Login
   ├─ demo/demo123 (Technician)
   ├─ foreman/foreman123 (Foreman)
   └─ super/super123 (Superintendent)

4. Test Features
   ├─ View tools (all roles)
   ├─ Try to create tool (only foreman/super)
   └─ Use RoleSwitcher to change roles

5. Test Logout
   └─ Verify token cleared and redirected to login
```
