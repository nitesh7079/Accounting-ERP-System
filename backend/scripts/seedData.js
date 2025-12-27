const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Company = require('../models/Company');
const Group = require('../models/Group');
const Ledger = require('../models/Ledger');
const Voucher = require('../models/Voucher');
const InventoryItem = require('../models/InventoryItem');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Group.deleteMany({});
    await Ledger.deleteMany({});
    await Voucher.deleteMany({});
    await InventoryItem.deleteMany({});

    console.log('Cleared existing data');

    // Create Company
    const company = await Company.create({
      name: 'ABC Corporation Ltd.',
      address: {
        street: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001'
      },
      gstin: '27AABCU9603R1ZM',
      pan: 'AABCU9603R',
      email: 'contact@abccorp.com',
      phone: '+91 9876543210',
      currency: 'INR',
      financialYear: {
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31')
      },
      booksBeginningFrom: new Date('2024-04-01')
    });

    console.log('Created company');

    // Create Admin User
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@abccorp.com',
      password: 'admin123',
      role: 'admin',
      company: company._id
    });

    // Create Accountant User
    const accountantUser = await User.create({
      username: 'accountant',
      email: 'accountant@abccorp.com',
      password: 'account123',
      role: 'accountant',
      company: company._id
    });

    console.log('Created users');

    // Create Default Groups
    const defaultGroups = Group.getDefaultGroups();
    const groupsToCreate = defaultGroups.map(group => ({
      ...group,
      company: company._id
    }));

    const groups = await Group.insertMany(groupsToCreate);
    console.log('Created default groups');

    // Helper function to find group by name
    const findGroup = (name) => groups.find(g => g.name === name);

    // Create Ledgers
    const cashLedger = await Ledger.create({
      name: 'Cash',
      company: company._id,
      group: findGroup('Cash-in-Hand')._id,
      openingBalance: {
        amount: 100000,
        type: 'Dr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 100000,
        type: 'Dr'
      }
    });

    const bankLedger = await Ledger.create({
      name: 'HDFC Bank',
      company: company._id,
      group: findGroup('Bank Accounts')._id,
      openingBalance: {
        amount: 500000,
        type: 'Dr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 500000,
        type: 'Dr'
      },
      bankDetails: {
        accountNumber: '12345678901234',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branch: 'Mumbai Main Branch'
      }
    });

    const capitalLedger = await Ledger.create({
      name: 'Capital Account',
      company: company._id,
      group: findGroup('Capital Account')._id,
      openingBalance: {
        amount: 600000,
        type: 'Cr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 600000,
        type: 'Cr'
      }
    });

    const salesLedger = await Ledger.create({
      name: 'Sales Account',
      company: company._id,
      group: findGroup('Sales Accounts')._id,
      openingBalance: {
        amount: 0,
        type: 'Cr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 0,
        type: 'Cr'
      },
      gstApplicable: true,
      gstType: 'Regular'
    });

    const purchaseLedger = await Ledger.create({
      name: 'Purchase Account',
      company: company._id,
      group: findGroup('Purchase Accounts')._id,
      openingBalance: {
        amount: 0,
        type: 'Dr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 0,
        type: 'Dr'
      },
      gstApplicable: true,
      gstType: 'Regular'
    });

    // Create Sundry Debtors
    const debtor1 = await Ledger.create({
      name: 'XYZ Enterprises',
      company: company._id,
      group: findGroup('Sundry Debtors')._id,
      openingBalance: {
        amount: 50000,
        type: 'Dr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 50000,
        type: 'Dr'
      },
      contactDetails: {
        address: '456 Market Road',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+91 9876543211',
        email: 'xyz@enterprises.com',
        gstin: '07AACFX1234A1Z5',
        pan: 'AACFX1234A'
      }
    });

    // Create Sundry Creditors
    const creditor1 = await Ledger.create({
      name: 'PQR Suppliers',
      company: company._id,
      group: findGroup('Sundry Creditors')._id,
      openingBalance: {
        amount: 30000,
        type: 'Cr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 30000,
        type: 'Cr'
      },
      contactDetails: {
        address: '789 Supply Lane',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        phone: '+91 9876543212',
        email: 'pqr@suppliers.com',
        gstin: '27AACFP5678B1Z3',
        pan: 'AACFP5678B'
      }
    });

    // Create expense ledgers
    const rentLedger = await Ledger.create({
      name: 'Rent Expenses',
      company: company._id,
      group: findGroup('Indirect Expenses')._id,
      openingBalance: {
        amount: 0,
        type: 'Dr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 0,
        type: 'Dr'
      }
    });

    const salaryLedger = await Ledger.create({
      name: 'Salary Expenses',
      company: company._id,
      group: findGroup('Indirect Expenses')._id,
      openingBalance: {
        amount: 0,
        type: 'Dr',
        date: new Date('2024-04-01')
      },
      currentBalance: {
        amount: 0,
        type: 'Dr'
      }
    });

    console.log('Created ledgers');

    // Create Inventory Items
    const item1 = await InventoryItem.create({
      name: 'Product A',
      company: company._id,
      stockGroup: 'Finished Goods',
      unit: 'Nos',
      hsnCode: '84158900',
      gstRate: 18,
      openingStock: {
        quantity: 100,
        rate: 500,
        value: 50000,
        date: new Date('2024-04-01')
      },
      currentStock: {
        quantity: 100,
        value: 50000
      },
      reorderLevel: 20,
      valuationMethod: 'FIFO'
    });

    const item2 = await InventoryItem.create({
      name: 'Product B',
      company: company._id,
      stockGroup: 'Finished Goods',
      unit: 'Nos',
      hsnCode: '84159000',
      gstRate: 12,
      openingStock: {
        quantity: 200,
        rate: 300,
        value: 60000,
        date: new Date('2024-04-01')
      },
      currentStock: {
        quantity: 200,
        value: 60000
      },
      reorderLevel: 30,
      valuationMethod: 'Average'
    });

    console.log('Created inventory items');

    // Create Sample Vouchers
    // Payment Voucher
    await Voucher.create({
      voucherNumber: 'PAY-001',
      voucherType: 'Payment',
      company: company._id,
      date: new Date('2024-04-05'),
      entries: [
        {
          ledger: rentLedger._id,
          type: 'Dr',
          amount: 25000
        },
        {
          ledger: cashLedger._id,
          type: 'Cr',
          amount: 25000
        }
      ],
      narration: 'Rent paid for April 2024',
      totalAmount: 25000,
      createdBy: adminUser._id
    });

    // Receipt Voucher
    await Voucher.create({
      voucherNumber: 'REC-001',
      voucherType: 'Receipt',
      company: company._id,
      date: new Date('2024-04-10'),
      entries: [
        {
          ledger: bankLedger._id,
          type: 'Dr',
          amount: 30000
        },
        {
          ledger: debtor1._id,
          type: 'Cr',
          amount: 30000
        }
      ],
      narration: 'Received payment from XYZ Enterprises',
      totalAmount: 30000,
      createdBy: accountantUser._id
    });

    // Sales Voucher
    await Voucher.create({
      voucherNumber: 'SALE-001',
      voucherType: 'Sales',
      company: company._id,
      date: new Date('2024-04-15'),
      invoiceNumber: 'INV-001',
      party: debtor1._id,
      entries: [
        {
          ledger: debtor1._id,
          type: 'Dr',
          amount: 59000
        },
        {
          ledger: salesLedger._id,
          type: 'Cr',
          amount: 50000
        },
        {
          ledger: (await Ledger.create({
            name: 'CGST Output',
            company: company._id,
            group: findGroup('Duties & Taxes')._id,
            openingBalance: { amount: 0, type: 'Cr', date: new Date('2024-04-01') }
          }))._id,
          type: 'Cr',
          amount: 4500
        },
        {
          ledger: (await Ledger.create({
            name: 'SGST Output',
            company: company._id,
            group: findGroup('Duties & Taxes')._id,
            openingBalance: { amount: 0, type: 'Cr', date: new Date('2024-04-01') }
          }))._id,
          type: 'Cr',
          amount: 4500
        }
      ],
      gstDetails: {
        taxableAmount: 50000,
        cgst: { rate: 9, amount: 4500 },
        sgst: { rate: 9, amount: 4500 },
        igst: { rate: 0, amount: 0 },
        totalTax: 9000
      },
      items: [
        {
          inventoryItem: item1._id,
          quantity: 100,
          rate: 500,
          amount: 50000,
          discount: 0
        }
      ],
      narration: 'Sale of Product A',
      totalAmount: 59000,
      createdBy: accountantUser._id
    });

    // Journal Voucher
    await Voucher.create({
      voucherNumber: 'JNL-001',
      voucherType: 'Journal',
      company: company._id,
      date: new Date('2024-04-20'),
      entries: [
        {
          ledger: salaryLedger._id,
          type: 'Dr',
          amount: 50000
        },
        {
          ledger: bankLedger._id,
          type: 'Cr',
          amount: 50000
        }
      ],
      narration: 'Salary paid for April 2024',
      totalAmount: 50000,
      createdBy: adminUser._id
    });

    console.log('Created sample vouchers');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Admin:');
    console.log('  Email: admin@abccorp.com');
    console.log('  Password: admin123\n');
    console.log('Accountant:');
    console.log('  Email: accountant@abccorp.com');
    console.log('  Password: account123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed
connectDB().then(() => seedData());
