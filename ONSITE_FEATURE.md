# 🏗️ Onsite List Feature

## Overview
The **Onsite** tab shows real-time tracking of employees on the job site and which tools they currently have checked out. This helps foremen and superintendents quickly see:
- Who is working on site
- What tools each person has
- How long they've had the tools
- Who is available (no tools checked out)

## Features

### 📊 Active Employees Section
Shows employees who currently have tools checked out:
- **Avatar & Name** - Visual identification
- **Role Badge** - Technician, Foreman, or Superintendent
- **Company** - Which company they work for
- **Tool Count** - Number of tools currently checked out
- **Tool List** - Detailed list of each checked out tool with:
  - Tool name and serial number
  - Checkout date
  - Status indicator (yellow dot = in use)

### 👥 Available Employees Section
Shows employees on site who don't have tools checked out:
- Grid view for quick scanning
- Name and role displayed
- Ready to be assigned tools

## How to Use

### View Onsite Status
1. Login to the app
2. Click the **"Onsite"** tab (between Tools and Materials)
3. See active employees at the top
4. Available employees shown at the bottom

### Tab Badge
The Onsite tab shows a count: `Onsite (X active)` where X = number of tools currently checked out

## Demo Data

The seed script now creates demo employees with tools checked out:

| Employee | Company | Tools Checked Out |
|----------|---------|-------------------|
| john_smith | ABC Construction | Hammer Drill, Circular Saw |
| sarah_jones | ABC Construction | Impact Driver |
| mike_wilson | XYZ Electric | Level, Multimeter, Wire Stripper |
| lisa_brown | XYZ Electric | None (Available) |

## Setup

### 1. Re-run Seed Script
If you already ran the seed script before, you need to reset the database:

```bash
cd backend

# Option A: Delete and recreate database
rm instance/trade_tracker.db
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()

# Run updated seed script
python seed_users.py
```

### 2. Start the App
```bash
# Terminal 1
cd backend && python run.py

# Terminal 2
cd frontend && npm run dev
```

### 3. View Onsite List
1. Login with any account (demo/demo123)
2. Click the **Onsite** tab
3. See employees with checked out tools

## What You'll See

### Active Section
```
🏗️ Active On Site (3)

┌─────────────────────────────────────────────┐
│ [J] john_smith           📦 2 Tools         │
│     technician                              │
│     📍 ABC Construction                     │
│                                             │
│     🔧 Checked Out Tools:                   │
│     ● Makita Hammer Drill (SN: HD-2024-001)│
│       🕒 2 days ago                         │
│     ● DeWalt Circular Saw (SN: CS-2024-002)│
│       🕒 2 days ago                         │
└─────────────────────────────────────────────┘

[Similar cards for sarah_jones and mike_wilson]
```

### Available Section
```
👥 Available (1)

┌────────┐
│   [L]  │
│  lisa  │
│ foreman│
└────────┘
```

## Use Cases

### For Foremen
- Quickly check who has which tools
- Identify tools that have been out for a long time
- Find available workers for new assignments
- Track tool accountability

### For Superintendents
- Monitor resource allocation across multiple sites
- Identify bottlenecks (workers waiting for tools)
- Company-level tool tracking
- Planning and scheduling

### For Technicians
- See what coworkers have checked out
- Know who to ask if looking for a specific tool
- Transparency in tool availability

## Technical Details

### Components
- **OnsiteList.jsx** - Main component displaying employee list
- Groups tools by checked_out_by user ID
- Filters to show only active checkouts
- Responsive grid layout

### Data Flow
1. App fetches all users from `/api/auth/users`
2. App fetches all tools from `/api/tools`
3. OnsiteList component joins data client-side
4. Displays employees with their checked out tools
5. Sorts by tool count (most tools first)

### Backend API
- `GET /api/auth/users` - Returns all active users
- Protected with JWT authentication
- Only returns active employees

## Future Enhancements

- [ ] Filter by company
- [ ] Sort by checkout duration
- [ ] Search for specific employee
- [ ] Click to see employee details
- [ ] Direct check-in from onsite list
- [ ] Export onsite report
- [ ] Real-time updates via WebSocket
- [ ] Location-based filtering (by site/building)
- [ ] Overdue tool alerts
- [ ] Employee contact information

## Benefits

✅ **Real-time visibility** - See who has what, right now
✅ **Accountability** - Track tool custody and duration
✅ **Efficiency** - Quickly locate tools through people
✅ **Planning** - Better resource allocation
✅ **Safety** - Know who is working with what equipment
