const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  ownerId: {
    type: String, // Kept as String to ensure older uploaded listings don't vanish due to strict BSON typing!
    required: true
  },
  title: {
    type: String,
    required: [true, 'Listing title is required'],
    trim: true,
    maxlength: 100
  },
  accommodationType: {
    type: String,
    required: [true, 'Accommodation type is required'],
    enum: ['Single Room', 'Shared Room', 'Annex/Portion', 'Apartment/Flat', 'Hostel', 'Studio', 'Other']
  },
  otherAccommodationType: { type: String },
  capacity: { type: Number, required: true, min: 1 },
  bedsPerRoom: { type: Number },
  monthlyRent: { type: Number, required: true, min: [0, 'Rent must be positive'] },
  address: { type: String, required: true, trim: true },
  facilities: [{ type: String }],
  photos: {
    type: [String],
    validate: [val => val.length > 0 && val.length <= 10, 'Must have at least 1 photo and max 10 photos']
  },
  contactNumber: {
    type: String,
    required: true,
    match: [/^(?:\+94|0)[7]\d{8}$/, 'Please fill a valid Sri Lankan mobile number']
  },
  availabilityStatus: {
    type: String,
    required: true,
    enum: ['Available', 'Occupied', 'Booking Accepted', 'Under Maintenance'],
    default: 'Available'
  },
  description: { type: String, maxlength: 500 },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  trialExpiresAt: {
    type: Date,
    default: function() {
      // Set trial expiration to 7 days from creation
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },
  paymentStatus: {
    type: String,
    enum: ['trial', 'paid', 'expired'],
    default: 'trial'
  },
  lastPaymentDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
