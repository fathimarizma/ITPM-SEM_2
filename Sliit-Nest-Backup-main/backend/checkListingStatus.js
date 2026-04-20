const mongoose = require('mongoose');
const Listing = require('./src/models/Listing');
require('dotenv').config();

const checkListingStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const listings = await Listing.find({});
    const now = new Date();

    console.log('\n=== LISTING STATUS REPORT ===\n');

    listings.forEach((listing, index) => {
      const trialExpired = listing.trialExpiresAt < now;
      const daysUntilExpiry = Math.ceil((listing.trialExpiresAt - now) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   ID: ${listing._id}`);
      console.log(`   Status: ${listing.status}`);
      console.log(`   Payment Status: ${listing.paymentStatus}`);
      console.log(`   Trial Expires: ${listing.trialExpiresAt}`);
      console.log(`   Trial Expired: ${trialExpired ? 'YES' : 'NO'}`);
      console.log(`   Days Until Expiry: ${daysUntilExpiry > 0 ? daysUntilExpiry : 0}`);
      console.log(`   Needs Payment: ${trialExpired && listing.paymentStatus === 'trial' ? 'YES' : 'NO'}`);
      console.log('   ---');
    });

    console.log('\n=== SUMMARY ===');
    const expiredCount = listings.filter(l => l.trialExpiresAt < now && l.paymentStatus === 'trial').length;
    const activeCount = listings.filter(l => l.trialExpiresAt >= now && l.paymentStatus === 'trial').length;
    const paidCount = listings.filter(l => l.paymentStatus === 'paid').length;

    console.log(`Total Listings: ${listings.length}`);
    console.log(`Expired Trials (Need Payment): ${expiredCount}`);
    console.log(`Active Trials: ${activeCount}`);
    console.log(`Paid Listings: ${paidCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkListingStatus();
