const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const Group = require('../models/Group');

const checkGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');

    const groups = await Group.find({}).sort({ name: 1 });
    
    console.log(`Total groups in database: ${groups.length}\n`);
    console.log('All groups:');
    console.log('====================');
    groups.forEach((group, index) => {
      console.log(`${index + 1}. ${group.name} (${group.nature})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkGroups();
