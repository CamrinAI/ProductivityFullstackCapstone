# Authentication & Role-Based Access Control

## Overview
The Trade Tracker app now includes a complete authentication system with role-based access control. Users must log in to access the application, and different roles have different permissions.

## User Roles

### 1. **Technician** (Default)
- Can view all tools and materials
- Can check out and check in tools
- **Cannot** create, edit, or delete tools/materials

### 2. **Foreman**
- All technician permissions
- **Can** create, edit, and delete tools
- Special access badge displayed in header
- Access to management features

### 3. **Superintendent**
- All foreman permissions
- **Can** manage materials (full CRUD)
- Highest level access badge
- Full administrative control

## Features

### Login/Signup System
- Unified login page with toggle between login and signup
- Form validation with error messages
- Styled with daisyUI components
- Secure password hashing

### User Experience
- **Greeting**: "Hello [username]" displayed in header
- **Role Badge**: Visual indicator for Foreman/Superintendent roles
- **Logout Button**: Easy access to sign out
- **Role-Based UI**: Features only shown to users with appropriate permissions
- **Protected Routes**: Backend enforces role requirements

## Demo Users

Run the seed script to create demo users:

```bash
cd backend
python seed_users.py
```

### Test Credentials

| Role            | Username  | Password    |
|-----------------|-----------|-------------|
| Technician      | demo      | demo123     |
| Foreman         | foreman   | foreman123  |
| Superintendent  | super     | super123    |

## Technical Implementation

### Frontend (`/frontend`)
- **AuthContext**: React Context for authentication state
- **LoginPage**: Unified login/signup form with daisyUI styling
- **Protected Routes**: App only renders when user is authenticated
- **Role Checks**: UI conditionally renders based on `user.role`

### Backend (`/backend`)
- **JWT Tokens**: Secure authentication using Flask-JWT-Extended
- **Password Hashing**: Werkzeug for secure password storage
- **Role Middleware**: `@require_role()` decorator for route protection
- **User Model**: Stores role information in database

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout (client-side token removal)
- `POST /api/auth/change-role` - Change user role (for testing)

#### Tools (Protected)
- `GET /api/tools` - View tools (All roles)
- `POST /api/tools` - Create tool (Foreman, Superintendent only)
- `PUT /api/tools/:id` - Update tool (Foreman, Superintendent only)
- `DELETE /api/tools/:id` - Delete tool (Foreman, Superintendent only)

## Usage Flow

1. **First Time**: User registers with username, email, password
2. **Login**: User logs in with username/password
3. **JWT Token**: Stored in localStorage, sent with all API requests
4. **Role Check**: Backend validates role for protected operations
5. **Logout**: Token removed from localStorage

## Security Notes

- Passwords are hashed using Werkzeug's `generate_password_hash`
- JWT tokens expire after 24 hours (configurable)
- Role checks performed on both frontend (UX) and backend (security)
- Protected routes return 401 (unauthorized) or 403 (forbidden)

## Development

### To test role-based features:
1. Start the backend: `cd backend && python run.py`
2. Start the frontend: `cd frontend && npm run dev`
3. Run seed script: `python backend/seed_users.py`
4. Login with different demo accounts to see role differences
5. Try creating tools as technician (should fail)
6. Login as foreman/super and create tools (should succeed)

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Session management (revoke tokens)
- [ ] Activity logging per user
- [ ] Team/company-based access control
- [ ] Two-factor authentication (2FA)
