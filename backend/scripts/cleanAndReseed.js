const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Company = require('../models/Company');
const Group = require('../models/Group');
const Ledger = require('../models/Ledger');
const Voucher = require('../models/Voucher');
const InventoryItem = require('../models/InventoryItem');

const cleanAndReseed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');

    // Delete EVERYTHING
    console.log('Deleting all data...');
    await User.deleteMany({});
    await Company.deleteMany({});
    await Group.deleteMany({});
    await Ledger.deleteMany({});
    await Voucher.deleteMany({});
    await InventoryItem.deleteMany({});
    
    console.log('✅ All data deleted\n');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    console.log('\nNow run: node scripts/seedData.js');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanAndReseed();
