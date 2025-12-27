# API Testing Guide

This document provides sample API requests for testing the Accounting ERP System.

## Base URL
```
http://localhost:5000/api
```

## 1. Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "accountant",
  "company": "COMPANY_ID_HERE"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@abccorp.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "admin",
    "email": "admin@abccorp.com",
    "role": "admin",
    "company": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## 2. Companies

### Create Company
```http
POST /companies
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Company Ltd.",
  "address": {
    "street": "123 Business St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "pincode": "400001"
  },
  "gstin": "27AABCU9603R1ZM",
  "pan": "AABCU9603R",
  "email": "info@newcompany.com",
  "phone": "+91 9876543210",
  "currency": "INR",
  "financialYear": {
    "startDate": "2024-04-01",
    "endDate": "2025-03-31"
  },
  "booksBeginningFrom": "2024-04-01"
}
```

### Get All Companies
```http
GET /companies
Authorization: Bearer YOUR_TOKEN_HERE
```

## 3. Ledgers

### Create Ledger
```http
POST /ledgers
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Customer Ledger",
  "company": "COMPANY_ID",
  "group": "GROUP_ID",
  "openingBalance": {
    "amount": 10000,
    "type": "Dr",
    "date": "2024-04-01"
  },
  "contactDetails": {
    "phone": "+91 9876543210",
    "email": "customer@example.com",
    "gstin": "27AABCU9603R1ZM"
  }
}
```

### Get All Ledgers
```http
GET /ledgers?company=COMPANY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Ledger Statement
```http
GET /ledgers/LEDGER_ID/statement?startDate=2024-04-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

## 4. Vouchers

### Create Payment Voucher
```http
POST /vouchers
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "voucherType": "Payment",
  "company": "COMPANY_ID",
  "date": "2024-05-15",
  "entries": [
    {
      "ledger": "EXPENSE_LEDGER_ID",
      "type": "Dr",
      "amount": 5000
    },
    {
      "ledger": "CASH_LEDGER_ID",
      "type": "Cr",
      "amount": 5000
    }
  ],
  "narration": "Office rent payment",
  "totalAmount": 5000
}
```

### Create Sales Voucher with GST
```http
POST /vouchers
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "voucherType": "Sales",
  "company": "COMPANY_ID",
  "date": "2024-05-20",
  "invoiceNumber": "INV-001",
  "party": "DEBTOR_LEDGER_ID",
  "entries": [
    {
      "ledger": "DEBTOR_LEDGER_ID",
      "type": "Dr",
      "amount": 11800
    },
    {
      "ledger": "SALES_LEDGER_ID",
      "type": "Cr",
      "amount": 10000
    },
    {
      "ledger": "CGST_OUTPUT_LEDGER_ID",
      "type": "Cr",
      "amount": 900
    },
    {
      "ledger": "SGST_OUTPUT_LEDGER_ID",
      "type": "Cr",
      "amount": 900
    }
  ],
  "gstDetails": {
    "taxableAmount": 10000,
    "cgst": { "rate": 9, "amount": 900 },
    "sgst": { "rate": 9, "amount": 900 },
    "igst": { "rate": 0, "amount": 0 },
    "totalTax": 1800
  },
  "items": [
    {
      "inventoryItem": "ITEM_ID",
      "quantity": 20,
      "rate": 500,
      "amount": 10000,
      "discount": 0
    }
  ],
  "narration": "Sale of goods",
  "totalAmount": 11800
}
```

### Get Vouchers
```http
GET /vouchers?company=COMPANY_ID&voucherType=Sales&startDate=2024-04-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

## 5. Inventory

### Create Inventory Item
```http
POST /inventory
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Product X",
  "company": "COMPANY_ID",
  "stockGroup": "Finished Goods",
  "unit": "Nos",
  "hsnCode": "84158900",
  "gstRate": 18,
  "openingStock": {
    "quantity": 100,
    "rate": 500,
    "value": 50000,
    "date": "2024-04-01"
  },
  "reorderLevel": 20,
  "valuationMethod": "FIFO"
}
```

### Get Stock Summary
```http
GET /inventory/summary?company=COMPANY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

## 6. Reports

### Get Trial Balance
```http
GET /reports/trial-balance?company=COMPANY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Profit & Loss
```http
GET /reports/profit-loss?company=COMPANY_ID&startDate=2024-04-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Balance Sheet
```http
GET /reports/balance-sheet?company=COMPANY_ID&date=2024-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Cash Book
```http
GET /reports/cash-book?company=COMPANY_ID&startDate=2024-04-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Day Book
```http
GET /reports/day-book?company=COMPANY_ID&date=2024-05-15
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Receivables
```http
GET /reports/receivables?company=COMPANY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Dashboard
```http
GET /reports/dashboard?company=COMPANY_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

## 7. GST Reports

### Get GST Summary
```http
GET /gst/summary?company=COMPANY_ID&startDate=2024-04-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get GSTR-1
```http
GET /gst/gstr1?company=COMPANY_ID&month=5&year=2024
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get GSTR-2
```http
GET /gst/gstr2?company=COMPANY_ID&month=5&year=2024
Authorization: Bearer YOUR_TOKEN_HERE
```

## Testing with Postman

1. Import this file as a collection in Postman
2. Create an environment with these variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set after login)
   - `company_id`: (from your company)
   - `ledger_id`: (from your ledgers)

3. After login, save the token:
   - In the login request's Tests tab:
   ```javascript
   pm.environment.set("token", pm.response.json().data.token);
   ```

4. Use `{{token}}` in Authorization headers

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // for list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "errors": []  // validation errors if any
}
```

## Notes

- All protected routes require `Authorization: Bearer TOKEN` header
- Dates should be in ISO format: `YYYY-MM-DD`
- Vouchers must have Dr = Cr (total debit = total credit)
- GST calculations should be accurate
- Inventory transactions automatically update stock levels
