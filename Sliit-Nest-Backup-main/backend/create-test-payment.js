const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function createTestPayment() {
  try {
    console.log('=== Creating Test Payment ===');
    
    // Find a test user (owner)
    const testUser = await User.findOne({ role: 'Owner' });
    if (!testUser) {
      console.log('No owner user found');
      return;
    }
    console.log('Using user:', testUser.firstName, testUser.email);
    
    // Find a test listing
    const testListing = await Listing.findOne();
    if (!testListing) {
      console.log('No listing found');
      return;
    }
    console.log('Using listing:', testListing.title);
    
    // Create test payment
    const testPayment = new Payment({
      user: testUser._id,
      listingId: testListing._id,
      paymentMethod: 'bank_transfer',
      transactionId: 'TEST-' + Date.now(),
      amount: 18000,
      notes: 'Test payment for approval testing',
      paymentSlip: 'test-slip.jpg',
      status: 'pending'
    });
    
    await testPayment.save();
    console.log('✅ Test payment created successfully!');
    console.log('Payment ID:', testPayment._id);
    console.log('Amount: Rs.', testPayment.amount);
    console.log('Status:', testPayment.status);
    
  } catch (error) {
    console.error('❌ Error creating test payment:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestPayment();
