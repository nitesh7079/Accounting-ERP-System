const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const Group = require('../models/Group');
const Company = require('../models/Company');

const checkAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');

    const companies = await Company.find({});
    console.log(`Total companies: ${companies.length}\n`);
    
    for (const company of companies) {
      console.log(`\n==== Company: ${company.name} ====`);
      const groups = await Group.find({ company: company._id }).sort({ name: 1 });
      console.log(`Groups for this company: ${groups.length}`);
      groups.forEach((group, index) => {
        console.log(`  ${index + 1}. ${group.name}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAllData();
