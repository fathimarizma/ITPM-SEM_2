const mongoose = require('mongoose');
const Payment = require('./src/models/Payment');
const User = require('./src/models/User');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function testApproval() {
  try {
    console.log('=== Testing Payment Approval Manually ===');
    
    const paymentId = '69d1d389ec825d5d8bb1b009';
    
    // Get admin user
    const adminUser = await User.findOne({ role: 'Admin' });
    console.log('Admin user:', adminUser?.firstName, adminUser?.email);
    
    // Get payment
    const payment = await Payment.findById(paymentId);
    console.log('Payment before approval:', {
      id: payment._id,
      status: payment.status,
      amount: payment.amount
    });
    
    // Get listing
    const listing = await Listing.findById(payment.listingId);
    console.log('Listing before approval:', {
      id: listing._id,
      title: listing.title,
      paymentStatus: listing.paymentStatus
    });
    
    // Simulate the approval process
    if (payment.status !== 'pending') {
      console.log('Payment is not pending:', payment.status);
      return;
    }
    
    // Update listing payment status
    await Listing.findByIdAndUpdate(payment.listingId, {
      paymentStatus: 'paid',
      lastPaymentDate: new Date()
    });
    
    // Update payment status
    payment.status = 'approved';
    payment.adminNotes = 'Test approval';
    payment.reviewedBy = adminUser._id;
    payment.reviewedAt = new Date();
    await payment.save();
    
    console.log('✅ Payment approved successfully!');
    
    // Verify changes
    const updatedPayment = await Payment.findById(paymentId);
    const updatedListing = await Listing.findById(payment.listingId);
    
    console.log('Payment after approval:', {
      id: updatedPayment._id,
      status: updatedPayment.status,
      reviewedBy: updatedPayment.reviewedBy,
      reviewedAt: updatedPayment.reviewedAt
    });
    
    console.log('Listing after approval:', {
      id: updatedListing._id,
      title: updatedListing.title,
      paymentStatus: updatedListing.paymentStatus,
      lastPaymentDate: updatedListing.lastPaymentDate
    });
    
  } catch (error) {
    console.error('❌ Error during approval test:', error);
  } finally {
    mongoose.disconnect();
  }
}

testApproval();
