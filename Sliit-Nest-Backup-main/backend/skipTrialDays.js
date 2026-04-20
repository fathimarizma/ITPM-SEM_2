const mongoose = require('mongoose');
const Listing = require('./src/models/Listing');
require('dotenv').config();

const skipTrialDays = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all listings that are still in trial period
    const trialListings = await Listing.find({
      paymentStatus: 'trial',
      trialExpiresAt: { $gt: new Date() }
    });

    console.log(`Found ${trialListings.length} listings in trial period`);

    if (trialListings.length === 0) {
      console.log('No listings found in trial period');
      
      // Let's also check for any listings at all
      const allListings = await Listing.find({});
      console.log(`Total listings in database: ${allListings.length}`);
      
      if (allListings.length === 0) {
        console.log('No listings found. Creating a test listing with expired trial...');
        const User = require('./src/models/User');
        
        // Find or create an owner user
        let owner = await User.findOne({ role: 'Owner' });
        if (!owner) {
          owner = await User.create({
            firstName: 'Test',
            lastName: 'Owner',
            email: 'owner@test.com',
            password: 'password123',
            role: 'Owner',
            isVerified: true
          });
          console.log('Created test owner user');
        }

        // Create a test listing with expired trial
        const testListing = await Listing.create({
          ownerId: owner._id.toString(),
          title: 'Test Boarding House - Expired Trial',
          accommodationType: 'Hostel',
          capacity: 10,
          monthlyRent: 15000,
          address: '123 Test Street, Colombo',
          contactNumber: '0771234567',
          description: 'Test listing with expired trial for payment testing',
          facilities: ['WiFi', 'AC', 'Parking'],
          photos: ['test1.jpg'],
          status: 'Approved',
          trialExpiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          paymentStatus: 'trial'
        });
        
        console.log('Created test listing with expired trial:', testListing._id);
      }
      process.exit(0);
    }

    // Update each trial listing to expire now
    for (const listing of trialListings) {
      const originalExpiry = listing.trialExpiresAt;
      listing.trialExpiresAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      await listing.save();
      
      console.log(`Updated listing "${listing.title}"`);
      console.log(`  Original expiry: ${originalExpiry}`);
      console.log(`  New expiry: ${listing.trialExpiresAt}`);
      console.log(`  Status: ${listing.paymentStatus}`);
    }

    console.log('\n✅ Successfully expired all trial listings!');
    console.log('Now you can test the payment flow:');
    console.log('1. Login as an owner');
    console.log('2. Check dashboard for payment alerts');
    console.log('3. Click "Make Payment" from sidebar or dashboard');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

skipTrialDays();
