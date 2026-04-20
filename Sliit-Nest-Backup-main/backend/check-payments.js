const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function checkPayments() {
  try {
    console.log('=== Checking Payment Data ===');
    
    // 1. Get all payments without populate first
    const payments = await Payment.find({});
    console.log(`Found ${payments.length} payments total`);
    
    for (const payment of payments) {
      console.log(`\n--- Payment ID: ${payment._id} ---`);
      console.log(`User ID: ${payment.user}`);
      console.log(`Listing ID: ${payment.listingId}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Amount: ${payment.amount}`);
      
      // Check if user exists
      const user = await User.findById(payment.user);
      if (user) {
        console.log(`✓ User exists: ${user.firstName} ${user.lastName} (${user.email})`);
      } else {
        console.log(`✗ User NOT found for ID: ${payment.user}`);
      }
      
      // Check if listing exists
      const listing = await Listing.findById(payment.listingId);
      if (listing) {
        console.log(`✓ Listing exists: ${listing.title}`);
      } else {
        console.log(`✗ Listing NOT found for ID: ${payment.listingId}`);
      }
    }
    
    // 2. Test the populate query
    console.log('\n=== Testing Populate Query ===');
    const populatedPayments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address monthlyRent');
    
    console.log(`Populated payments: ${populatedPayments.length}`);
    populatedPayments.forEach(payment => {
      console.log(`Payment: ${payment._id}`);
      console.log(`User:`, payment.user);
      console.log(`Listing:`, payment.listingId);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkPayments();
