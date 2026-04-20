const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function checkPending() {
  try {
    console.log('=== Current Payment Status ===');
    
    const payments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address');
    
    console.log(`Total payments: ${payments.length}`);
    
    payments.forEach(payment => {
      console.log(`\nPayment ID: ${payment._id}`);
      console.log(`User: ${payment.user?.firstName || 'Unknown'} ${payment.user?.lastName || ''} (${payment.user?.email || 'Unknown'})`);
      console.log(`Listing: ${payment.listingId?.title || 'Unknown'}`);
      console.log(`Amount: Rs. ${payment.amount}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Created: ${payment.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkPending();
