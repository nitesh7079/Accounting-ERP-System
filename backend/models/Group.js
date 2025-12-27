const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  nature: {
    type: String,
    enum: ['Assets', 'Liabilities', 'Income', 'Expenses'],
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  affectsGrossProfit: {
    type: Boolean,
    default: false
  },
  description: String
}, {
  timestamps: true
});

// Default groups as per Tally ERP 9
groupSchema.statics.getDefaultGroups = function() {
  return [
    // Capital & Liabilities
    { name: 'Capital Account', nature: 'Liabilities', isPrimary: true },
    { name: 'Reserves & Surplus', nature: 'Liabilities', isPrimary: true },
    { name: 'Retained Earnings', nature: 'Liabilities', isPrimary: true },
    { name: 'Secured Loans', nature: 'Liabilities', isPrimary: true },
    { name: 'Unsecured Loans', nature: 'Liabilities', isPrimary: true },
    { name: 'Loans (Liability)', nature: 'Liabilities', isPrimary: true },
    { name: 'Bank OD A/c', nature: 'Liabilities', isPrimary: true },
    { name: 'Bank OCC A/c', nature: 'Liabilities', isPrimary: true },
    
    // Current Liabilities
    { name: 'Current Liabilities', nature: 'Liabilities', isPrimary: true },
    { name: 'Duties & Taxes', nature: 'Liabilities', isPrimary: true },
    { name: 'Provisions', nature: 'Liabilities', isPrimary: true },
    { name: 'Sundry Creditors', nature: 'Liabilities', isPrimary: true },
    
    // Fixed Assets
    { name: 'Fixed Assets', nature: 'Assets', isPrimary: true },
    { name: 'Buildings', nature: 'Assets', isPrimary: true },
    { name: 'Plant & Machinery', nature: 'Assets', isPrimary: true },
    { name: 'Furniture & Fixtures', nature: 'Assets', isPrimary: true },
    { name: 'Office Equipment', nature: 'Assets', isPrimary: true },
    { name: 'Computer Equipment', nature: 'Assets', isPrimary: true },
    { name: 'Vehicles', nature: 'Assets', isPrimary: true },
    { name: 'Land', nature: 'Assets', isPrimary: true },
    
    // Current Assets
    { name: 'Current Assets', nature: 'Assets', isPrimary: true },
    { name: 'Bank Accounts', nature: 'Assets', isPrimary: true },
    { name: 'Cash-in-Hand', nature: 'Assets', isPrimary: true },
    { name: 'Stock-in-Hand', nature: 'Assets', isPrimary: true },
    { name: 'Sundry Debtors', nature: 'Assets', isPrimary: true },
    { name: 'Deposits (Asset)', nature: 'Assets', isPrimary: true },
    { name: 'Loans & Advances (Asset)', nature: 'Assets', isPrimary: true },
    
    // Investments
    { name: 'Investments', nature: 'Assets', isPrimary: true },
    
    // Miscellaneous Expenses (Asset)
    { name: 'Misc. Expenses (ASSET)', nature: 'Assets', isPrimary: true },
    
    // Branch/Divisions
    { name: 'Branch / Divisions', nature: 'Assets', isPrimary: true },
    
    // Suspense Account
    { name: 'Suspense A/c', nature: 'Assets', isPrimary: true },
    
    // Sales Accounts
    { name: 'Sales Accounts', nature: 'Income', isPrimary: true, affectsGrossProfit: true },
    { name: 'Sales', nature: 'Income', isPrimary: true, affectsGrossProfit: true },
    
    // Purchase Accounts
    { name: 'Purchase Accounts', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Purchase', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    
    // Direct Incomes
    { name: 'Direct Incomes', nature: 'Income', isPrimary: true, affectsGrossProfit: true },
    { name: 'Income (Direct)', nature: 'Income', isPrimary: true, affectsGrossProfit: true },
    
    // Direct Expenses
    { name: 'Direct Expenses', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Expenses (Direct)', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Carriage Inwards', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Freight Inwards', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Manufacturing Expenses', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Power & Fuel', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Opening Stock', nature: 'Expenses', isPrimary: true, affectsGrossProfit: true },
    { name: 'Closing Stock', nature: 'Income', isPrimary: true, affectsGrossProfit: true },
    { name: 'Work-in-Progress', nature: 'Assets', isPrimary: true },
    
    // Indirect Incomes
    { name: 'Indirect Incomes', nature: 'Income', isPrimary: true },
    { name: 'Income (Indirect)', nature: 'Income', isPrimary: true },
    { name: 'Interest Received', nature: 'Income', isPrimary: true },
    { name: 'Dividend Received', nature: 'Income', isPrimary: true },
    { name: 'Discount Received', nature: 'Income', isPrimary: true },
    { name: 'Commission Received', nature: 'Income', isPrimary: true },
    { name: 'Rent Received', nature: 'Income', isPrimary: true },
    
    // Indirect Expenses
    { name: 'Expenses (Indirect)', nature: 'Expenses', isPrimary: true },
    { name: 'Indirect Expenses', nature: 'Expenses', isPrimary: true },
    { name: 'Advertisement', nature: 'Expenses', isPrimary: true },
    { name: 'Bank Charges', nature: 'Expenses', isPrimary: true },
    { name: 'Commission Paid', nature: 'Expenses', isPrimary: true },
    { name: 'Conveyance', nature: 'Expenses', isPrimary: true },
    { name: 'Depreciation', nature: 'Expenses', isPrimary: true },
    { name: 'Entertainment', nature: 'Expenses', isPrimary: true },
    { name: 'Freight Outwards', nature: 'Expenses', isPrimary: true },
    { name: 'Insurance', nature: 'Expenses', isPrimary: true },
    { name: 'Interest Paid', nature: 'Expenses', isPrimary: true },
    { name: 'Legal & Professional Charges', nature: 'Expenses', isPrimary: true },
    { name: 'Office Maintenance', nature: 'Expenses', isPrimary: true },
    { name: 'Postage & Courier', nature: 'Expenses', isPrimary: true },
    { name: 'Printing & Stationery', nature: 'Expenses', isPrimary: true },
    { name: 'Rent', nature: 'Expenses', isPrimary: true },
    { name: 'Repairs & Maintenance', nature: 'Expenses', isPrimary: true },
    { name: 'Salaries', nature: 'Expenses', isPrimary: true },
    { name: 'Staff Welfare', nature: 'Expenses', isPrimary: true },
    { name: 'Telephone Expenses', nature: 'Expenses', isPrimary: true },
    { name: 'Travelling Expenses', nature: 'Expenses', isPrimary: true },
    { name: 'Transportation Charges', nature: 'Expenses', isPrimary: true },
    { name: 'Utility Expenses', nature: 'Expenses', isPrimary: true },
    { name: 'Audit Fees', nature: 'Expenses', isPrimary: true },
    { name: 'Bad Debts', nature: 'Expenses', isPrimary: true },
    { name: 'Discount Allowed', nature: 'Expenses', isPrimary: true },
    
    // GST Related
    { name: 'CGST', nature: 'Liabilities', isPrimary: true },
    { name: 'SGST', nature: 'Liabilities', isPrimary: true },
    { name: 'IGST', nature: 'Liabilities', isPrimary: true },
    { name: 'GST Input', nature: 'Assets', isPrimary: true },
    { name: 'GST Output', nature: 'Liabilities', isPrimary: true },
    { name: 'TDS Payable', nature: 'Liabilities', isPrimary: true },
    { name: 'TDS Receivable', nature: 'Assets', isPrimary: true },
    { name: 'TCS Payable', nature: 'Liabilities', isPrimary: true },
    { name: 'TCS Receivable', nature: 'Assets', isPrimary: true },
    
    // Profit & Loss
    { name: 'Profit & Loss A/c', nature: 'Liabilities', isPrimary: true },
    
    // Rounding Off
    { name: 'Rounding Off', nature: 'Expenses', isPrimary: true }
  ];
};

module.exports = mongoose.model('Group', groupSchema);
