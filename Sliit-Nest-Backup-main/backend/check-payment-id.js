const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function checkPaymentId() {
  try {
    console.log('=== Checking Payment ID from Frontend ===');
    
    // Check the specific payment ID that was being attempted
    const paymentId = '69d1d389ec825d5d8bb1b009';
    console.log(`Looking for payment ID: ${paymentId}`);
    
    const payment = await Payment.findById(paymentId)
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address monthlyRent');
    
    if (payment) {
      console.log('✓ Payment found:');
      console.log(`  ID: ${payment._id}`);
      console.log(`  User: ${payment.user?.firstName || 'Unknown'} ${payment.user?.lastName || ''}`);
      console.log(`  Email: ${payment.user?.email || 'Unknown'}`);
      console.log(`  Listing: ${payment.listingId?.title || 'Unknown'}`);
      console.log(`  Amount: Rs. ${payment.amount}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  Created: ${payment.createdAt}`);
    } else {
      console.log('✗ Payment NOT found');
    }
    
    // Show all pending payments
    console.log('\n=== All Pending Payments ===');
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address monthlyRent');
    
    console.log(`Found ${pendingPayments.length} pending payments:`);
    pendingPayments.forEach(payment => {
      console.log(`- ${payment._id}: ${payment.user?.firstName || 'Unknown'} - ${payment.listingId?.title || 'Unknown'} - Rs. ${payment.amount}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkPaymentId();
