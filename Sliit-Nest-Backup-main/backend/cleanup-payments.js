const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function cleanupPayments() {
  try {
    console.log('=== Cleaning Up Bad Payment Data ===');
    
    // Find payments with missing user references
    const payments = await Payment.find();
    let deletedCount = 0;
    
    for (const payment of payments) {
      // Check if user exists
      const userExists = await User.exists({ _id: payment.user });
      
      if (!userExists) {
        console.log(`Deleting payment ${payment._id} - user ${payment.user} not found`);
        await Payment.findByIdAndDelete(payment._id);
        deletedCount++;
      }
    }
    
    console.log(`\nCleanup complete! Deleted ${deletedCount} payments with missing user references.`);
    
    // Show remaining payments
    const remainingPayments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address monthlyRent');
    
    console.log(`\nRemaining payments: ${remainingPayments.length}`);
    remainingPayments.forEach(payment => {
      console.log(`- ${payment._id}: ${payment.user?.firstName || 'Unknown'} - ${payment.listingId?.title || 'Unknown'} (${payment.status})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

cleanupPayments();
