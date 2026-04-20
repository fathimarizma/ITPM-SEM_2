const mongoose = require('mongoose');
const User = require('./src/models/User');
const Payment = require('./src/models/Payment');
const Listing = require('./src/models/Listing');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sliit-nest')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

async function testAdminPaymentApproval() {
  try {
    console.log('=== Testing Admin Payment Approval ===');
    
    // 1. Check if admin user exists
    const adminUsers = await User.find({ role: 'Admin' });
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(admin => {
      console.log(`- ${admin.firstName} ${admin.lastName} (${admin.email}) - Role: ${admin.role}`);
    });
    
    // 2. Check if there are any pending payments
    const pendingPayments = await Payment.find({ status: 'pending' })
      .populate('user', 'firstName lastName email role')
      .populate('listingId', 'title address');
    
    console.log(`\nFound ${pendingPayments.length} pending payments:`);
    pendingPayments.forEach(payment => {
      console.log(`- Payment ID: ${payment._id}`);
      console.log(`  User: ${payment.user.firstName} ${payment.user.lastName} (${payment.user.email}) - Role: ${payment.user.role}`);
      console.log(`  Listing: ${payment.listingId?.title || 'N/A'}`);
      console.log(`  Amount: Rs. ${payment.amount}`);
      console.log(`  Status: ${payment.status}`);
      console.log('---');
    });
    
    // 3. If no pending payments, create a test one
    if (pendingPayments.length === 0) {
      console.log('\nNo pending payments found. Creating a test payment...');
      
      // Find a test user and listing
      const testUser = await User.findOne({ role: 'Owner' });
      const testListing = await Listing.findOne();
      
      if (testUser && testListing) {
        const testPayment = new Payment({
          user: testUser._id,
          listingId: testListing._id,
          paymentMethod: 'bank_transfer',
          transactionId: 'TEST-123456',
          amount: 18000,
          notes: 'Test payment for admin approval',
          paymentSlip: 'test-slip.jpg',
          status: 'pending'
        });
        
        await testPayment.save();
        console.log('Test payment created with ID:', testPayment._id);
        console.log('You can now test the approval functionality in the admin dashboard.');
      } else {
        console.log('No test user or listing found to create a test payment.');
      }
    }
    
    console.log('\n=== Test Complete ===');
    console.log('To test payment approval:');
    console.log('1. Make sure you are logged in as an admin user');
    console.log('2. Navigate to the admin dashboard');
    console.log('3. Go to the Payment Approvals tab');
    console.log('4. Click the "Approve" button next to a pending payment');
    console.log('5. Check the browser console for debug messages');
    
  } catch (error) {
    console.error('Test Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testAdminPaymentApproval();
