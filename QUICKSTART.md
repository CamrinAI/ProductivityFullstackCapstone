# 🚀 Quick Start Guide - Authentication System

## Setup in 3 Steps

### Step 1: Install Dependencies (if not already done)
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd frontend
npm install
```

### Step 2: Create Demo Users
```bash
cd backend
python seed_users.py
```

Expected output:
```
Created user: demo (role: technician)
Created user: foreman (role: foreman)
Created user: super (role: superintendent)

✅ Demo users created successfully!
```

### Step 3: Start the Application
```bash
# Terminal 1 - Start Backend
cd backend
python run.py

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

## Test the System

### Login Credentials

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Technician | `demo` | `demo123` | View only |
| Foreman | `foreman` | `foreman123` | View + Manage Tools |
| Superintendent | `super` | `super123` | Full Admin |

### What to Test

1. **Login as Technician** (`demo` / `demo123`)
   - Notice basic view
   - See "Hello demo" at top
   - No management features visible

2. **Use Role Switcher** (bottom-right corner)
   - Click "Foreman" button
   - Page reloads
   - See management banner appear
   - Notice "Add Tool" button

3. **Switch to Superintendent**
   - Click "Superintendent" button
   - See "Full access" message
   - All management features available

4. **Logout**
   - Click logout button (top-right)
   - Returns to login page
   - Token cleared from localStorage

## Features You'll See

### 🎨 Visual Elements
- User greeting with username in header
- Role badge (yellow for Foreman, red for Superintendent)
- Logout button with icon
- Role-based info banner
- daisyUI breadcrumbs
- Role switcher (testing tool)

### 🔒 Security Features
- Must login to access app
- JWT tokens for API authentication
- Role-based route protection
- Secure password hashing

### 🎯 Role-Based Access
- **Technicians**: Can view and use tools
- **Foremen**: Can manage tools (create/edit/delete)
- **Superintendents**: Full admin access

## Troubleshooting

### "Demo users already exist"
The seed script won't recreate users. To reset:
```bash
# Delete the database and recreate
cd backend
rm instance/trade_tracker.db
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()
python seed_users.py
```

### Frontend not connecting to backend
- Ensure backend is running on `http://localhost:3000`
- Check `vite.config.js` proxy settings
- Clear browser cache

### Token expired
- Just logout and login again
- Tokens are valid for 24 hours by default

## Next Steps

Now that authentication is working:
1. Build tool creation forms (for Foreman/Super)
2. Add material management (for Superintendent)
3. Implement checkout history per user
4. Add team/company permissions
5. Create admin dashboard

## Need Help?

Check these files:
- `AUTH_GUIDE.md` - Complete authentication documentation
- `IMPLEMENTATION_SUMMARY.md` - What was implemented
- `README.md` - General project information

🎉 **You're all set! Happy coding!**
