# Accounting & ERP System

A complete web-based Accounting & ERP system similar to Tally ERP 9 that can manage all financial accounts of a company. Built with modern technologies including React.js, Node.js, Express.js, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Core Modules](#core-modules)
- [Screenshots](#screenshots)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 1. **Authentication & Authorization**
- JWT-based secure authentication
- Role-based access control (Admin, Accountant, Viewer)
- Password hashing with bcrypt
- Company-wise login system

### 2. **Company Management**
- Create and manage multiple companies
- Financial year configuration
- Company details (Name, Address, GSTIN, PAN, Currency)
- Books beginning date setup

### 3. **Ledger Management**
- Create, edit, and delete ledgers
- Pre-defined accounting groups (as per Tally)
- Custom group creation
- Opening and current balance tracking
- Support for Sundry Debtors and Creditors
- Bank account management

### 4. **Voucher Entry System**
- **8 Voucher Types:**
  - Payment Voucher
  - Receipt Voucher
  - Contra Voucher
  - Journal Voucher
  - Sales Voucher
  - Purchase Voucher
  - Credit Note
  - Debit Note
- Auto-generation of voucher numbers
- Debit = Credit validation
- Narration and date tracking
- Edit history and audit trail

### 5. **Inventory Management**
- Stock items with units of measure
- Opening and current stock tracking
- Stock valuation methods (FIFO, LIFO, Average)
- HSN/SAC code support
- Reorder level alerts
- Stock transaction history

### 6. **GST & Tax Module**
- CGST, SGST, IGST calculation
- HSN/SAC code support
- Tax rate configuration
- GST summary reports
- GSTR-1 and GSTR-2 reports

### 7. **Comprehensive Reports**
- **Financial Reports:**
  - Trial Balance
  - Profit & Loss Account
  - Balance Sheet
- **Books:**
  - Cash Book
  - Bank Book
  - Day Book
- **Outstanding Reports:**
  - Receivables
  - Payables
- **Inventory Reports:**
  - Stock Summary
- **GST Reports:**
  - GST Summary
  - GSTR-1 (Sales)
  - GSTR-2 (Purchase)

### 8. **Dashboard**
- Real-time financial metrics
- Total sales and purchase
- Cash and bank balances
- Profit/Loss snapshots
- Monthly sales charts
- Quick action links

### 9. **Export & Print**
- Export reports to PDF
- Export to Excel
- Print-friendly layouts

### 10. **Data Validation**
- Automatic debit-credit balancing
- Real-time ledger balance updates
- Financial year validation
- GST validation

---

## 🛠 Tech Stack

### Frontend
- **React.js** (v18.2.0) - UI Library
- **Tailwind CSS** - Styling
- **Chart.js** - Data Visualization
- **Axios** - HTTP Client
- **React Router** - Navigation
- **jsPDF** - PDF Generation
- **XLSX** - Excel Export

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password Hashing

### Development Tools
- **Nodemon** - Auto-restart
- **Concurrently** - Run multiple commands

---

## 💻 System Requirements

- **Node.js:** >= 14.0.0
- **MongoDB:** >= 4.4
- **npm or yarn:** Latest version
- **RAM:** Minimum 4GB
- **Disk Space:** Minimum 1GB

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/accounting-erp-system.git
cd accounting-erp-system
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### 1. Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/accounting_erp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 2. Setup MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3. Seed Sample Data (Optional)

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample company (ABC Corporation Ltd.)
- 2 users (admin and accountant)
- Default accounting groups
- Sample ledgers
- Sample vouchers
- Sample inventory items

**Login Credentials:**
- **Admin:**
  - Email: admin@abccorp.com
  - Password: admin123
- **Accountant:**
  - Email: accountant@abccorp.com
  - Password: account123

---

## 🚀 Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

### Option 2: Run Both Concurrently

```bash
npm run dev:full
```

This will start both backend and frontend simultaneously.

---

## 📁 Project Structure

```
accounting-erp-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── companyController.js  # Company management
│   │   ├── ledgerController.js   # Ledger operations
│   │   ├── groupController.js    # Group management
│   │   ├── voucherController.js  # Voucher handling
│   │   ├── inventoryController.js# Inventory management
│   │   ├── gstController.js      # GST operations
│   │   └── reportController.js   # Report generation
│   ├── middleware/
│   │   └── auth.js               # Auth middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Company.js            # Company schema
│   │   ├── Ledger.js             # Ledger schema
│   │   ├── Group.js              # Group schema
│   │   ├── Voucher.js            # Voucher schema
│   │   ├── InventoryItem.js      # Inventory schema
│   │   ├── StockTransaction.js   # Stock movement schema
│   │   └── GSTEntry.js           # GST entry schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── ledgerRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── voucherRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── gstRoutes.js
│   │   └── reportRoutes.js
│   ├── scripts/
│   │   └── seedData.js           # Sample data script
│   └── server.js                 # Entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── LedgerList.js
│   │   │   ├── VoucherList.js
│   │   │   ├── Reports.js
│   │   │   └── TrialBalance.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/updatepassword` | Update password | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Company Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/companies` | Create company | Admin |
| GET | `/api/companies` | Get all companies | Private |
| GET | `/api/companies/:id` | Get single company | Private |
| PUT | `/api/companies/:id` | Update company | Admin |
| DELETE | `/api/companies/:id` | Delete company | Admin |

### Ledger Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/ledgers` | Create ledger | Private |
| GET | `/api/ledgers` | Get all ledgers | Private |
| GET | `/api/ledgers/:id` | Get single ledger | Private |
| PUT | `/api/ledgers/:id` | Update ledger | Private |
| DELETE | `/api/ledgers/:id` | Delete ledger | Private |
| GET | `/api/ledgers/:id/statement` | Get ledger statement | Private |

### Voucher Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/vouchers` | Create voucher | Private |
| GET | `/api/vouchers` | Get all vouchers | Private |
| GET | `/api/vouchers/:id` | Get single voucher | Private |
| PUT | `/api/vouchers/:id` | Update voucher | Private |
| DELETE | `/api/vouchers/:id` | Delete voucher | Private |

### Report Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reports/trial-balance` | Get trial balance | Private |
| GET | `/api/reports/profit-loss` | Get P&L account | Private |
| GET | `/api/reports/balance-sheet` | Get balance sheet | Private |
| GET | `/api/reports/cash-book` | Get cash book | Private |
| GET | `/api/reports/bank-book` | Get bank book | Private |
| GET | `/api/reports/day-book` | Get day book | Private |
| GET | `/api/reports/receivables` | Get receivables | Private |
| GET | `/api/reports/payables` | Get payables | Private |
| GET | `/api/reports/stock-summary` | Get stock summary | Private |
| GET | `/api/reports/dashboard` | Get dashboard data | Private |

---

## 👥 User Roles

### Admin
- Full system access
- Create/manage companies
- Create/manage users
- All accounting operations
- View all reports

### Accountant
- Create/edit vouchers
- Manage ledgers
- View reports
- Limited to assigned company

### Viewer
- View-only access
- Can view reports
- Cannot create or edit data

---

## 🎯 Core Modules

### 1. Accounting Groups (Default)
- Capital Account
- Current Assets
- Current Liabilities
- Fixed Assets
- Investments
- Loans (Liability)
- Sundry Debtors
- Sundry Creditors
- Direct Expenses
- Direct Income
- Indirect Expenses
- Indirect Income
- Sales Accounts
- Purchase Accounts
- Bank Accounts
- Cash-in-Hand
- Duties & Taxes
- Provisions
- Reserves & Surplus
- Suspense Account

### 2. Voucher Types
1. **Payment Voucher** - Record cash/bank payments
2. **Receipt Voucher** - Record cash/bank receipts
3. **Contra Voucher** - Cash to bank or bank to cash transfers
4. **Journal Voucher** - Non-cash transactions
5. **Sales Voucher** - Record sales transactions
6. **Purchase Voucher** - Record purchase transactions
7. **Credit Note** - Sales returns
8. **Debit Note** - Purchase returns

---

## 🖼 Screenshots

### Dashboard
Displays real-time financial metrics, charts, and quick action links.

### Voucher Entry
Clean interface for fast data entry with automatic validation.

### Trial Balance
Professional report layout with export options.

### Ledger Statement
Detailed transaction history for any ledger.

---

## 💾 Sample Data

The seed script creates:
- 1 Company (ABC Corporation Ltd.)
- 2 Users (Admin & Accountant)
- 20 Default Accounting Groups
- 10+ Sample Ledgers
- 2 Inventory Items
- 4 Sample Vouchers

---

## 🔧 Troubleshooting

### MongoDB Connection Error
```
Error: Could not connect to MongoDB
```
**Solution:** Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution:** Change the port in `.env` file or kill the process using the port.

### Frontend Not Connecting to Backend
**Solution:** Make sure proxy is set in `frontend/package.json`:
```json
"proxy": "http://localhost:5000"
```

### JWT Token Expired
**Solution:** Login again to get a new token.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

Built with ❤️ by a Senior Full-Stack Developer & Accounting Domain Expert

---

## 📞 Support

For support, email support@example.com or create an issue in the GitHub repository.

---

## 🎓 Acknowledgments

- Inspired by Tally ERP 9
- Built with modern web technologies
- Follows accounting standards and best practices

---

## 🔮 Future Enhancements

- [ ] Multi-currency support
- [ ] Invoice printing templates
- [ ] Email integration for reports
- [ ] Budget management
- [ ] Cost center allocation
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Cloud backup
- [ ] Multi-language support
- [ ] Batch payment processing

---

**Happy Accounting! 📊💰**
