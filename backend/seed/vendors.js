require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');

const seedVendors = [
  {
    name: 'TechSupplies Co.',
    email: 'vendor1@example.com',
    contactPerson: 'Alice',
    phone: '+1-555-0100',
    category: ['electronics', 'laptops'],
  },
  {
    name: 'OfficeGear Ltd.',
    email: 'vendor2@example.com',
    contactPerson: 'Bob',
    phone: '+1-555-0200',
    category: ['furniture', 'monitors'],
  },
  {
    name: 'ProSolutions Inc.',
    email: 'vendor3@example.com',
    contactPerson: 'Carol',
    phone: '+1-555-0300',
    category: ['electronics', 'networking'],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rfp-manager');
  await Vendor.deleteMany({});
  await Vendor.insertMany(seedVendors);
  console.log('Seeded 3 vendors');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
