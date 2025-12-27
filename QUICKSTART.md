# Quick Setup Guide

## Prerequisites
1. Install Node.js (v14 or higher) - https://nodejs.org/
2. Install MongoDB (v4.4 or higher) - https://www.mongodb.com/try/download/community
3. Make sure MongoDB is running

## Installation Steps

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. Setup Database with Sample Data
```bash
npm run seed
```

This creates:
- Sample company (ABC Corporation Ltd.)
- Admin user (admin@abccorp.com / admin123)
- Accountant user (accountant@abccorp.com / account123)
- Default accounting groups
- Sample ledgers and vouchers

### 4. Run the Application

**Option A - Run separately:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Option B - Run together:**
```bash
npm run dev:full
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Login with: admin@abccorp.com / admin123

## Testing the Features

1. **Login** - Use the credentials above
2. **Dashboard** - View financial overview
3. **Create Voucher** - Go to Vouchers > Create Voucher
4. **Create Ledger** - Go to Ledgers > Create Ledger
5. **View Reports** - Go to Reports and explore various financial reports
6. **Trial Balance** - Reports > Trial Balance
7. **Export PDF** - Click "Export to PDF" on any report

## Common Issues

**Issue:** MongoDB connection error
**Fix:** Make sure MongoDB is running with `net start MongoDB` (Windows) or `brew services start mongodb-community` (Mac)

**Issue:** Port 5000 already in use
**Fix:** Change PORT in .env file to another port (e.g., 5001)

**Issue:** Frontend can't connect to backend
**Fix:** Make sure both servers are running and proxy is configured in frontend/package.json

## Next Steps

- Create your own company
- Set up your chart of accounts
- Start entering vouchers
- Generate reports

Happy Accounting! 📊
