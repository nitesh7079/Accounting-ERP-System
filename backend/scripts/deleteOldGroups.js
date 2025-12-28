const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Load models
const Group = require('../models/Group');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const deleteOldGroups = async () => {
  try {
    await connectDB();

    const groupsToDelete = [
      'Transportation Charges',
      'Utility Expenses',
      'Audit Fees',
      'Bad Debts',
      'Discount Allowed',
      'CGST',
      'SGST',
      'IGST',
      'GST Input',
      'GST Output',
      'TDS Payable',
      'TDS Receivable',
      'TCS Payable',
      'TCS Receivable',
      'Profit & Loss A/c',
      'Rounding Off',
      'Sales',
      'Purchase',
      'Carriage Inwards',
      'Freight Inwards',
      'Freight Outwards',
      'Manufacturing Expenses',
      'Power & Fuel',
      'Opening Stock',
      'Closing Stock',
      'Work-in-Progress',
      'Interest Received',
      'Dividend Received',
      'Discount Received',
      'Commission Received',
      'Rent Received',
      'Advertisement',
      'Bank Charges',
      'Commission Paid',
      'Conveyance',
      'Depreciation',
      'Entertainment',
      'Insurance',
      'Interest Paid',
      'Legal & Professional Charges',
      'Office Maintenance',
      'Postage & Courier',
      'Printing & Stationery',
      'Rent',
      'Repairs & Maintenance',
      'Salaries',
      'Staff Welfare',
      'Telephone Expenses',
      'Travelling Expenses',
      'Buildings',
      'Plant & Machinery',
      'Furniture & Fixtures',
      'Office Equipment',
      'Computer Equipment',
      'Vehicles',
      'Land'
    ];

    const result = await Group.deleteMany({ name: { $in: groupsToDelete } });
    
    console.log(`✅ Deleted ${result.deletedCount} old groups`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteOldGroups();
