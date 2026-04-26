const mongoose = require('mongoose');

const roommatePostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: {
      type: String,
      required: [true, 'Please add a bio or description'],
      trim: true,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    whatsappNumber: {
      type: String,
      required: [true, 'Please add your WhatsApp number'],
      match: [/^[0-9]{10}$/, 'WhatsApp number must be exactly 10 digits'],
    },
    genderPreference: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      required: [true, 'Please specify gender preference'],
    },
    budgetRange: {
      min: {
        type: Number,
        required: [true, 'Please specify minimum budget'],
      },
      max: {
        type: Number,
        required: [true, 'Please specify maximum budget'],
      },
    },
    habits: {
      nonSmoker: {
        type: Boolean,
        default: false,
      },
      studyPreference: {
        type: String,
        enum: ['Quiet', 'Group', 'Flexible'],
        required: [true, 'Please specify study preference'],
      },
    },
    location: {
      type: String,
      required: [true, 'Please specify preferred location (e.g. Near SLIIT)'],
    },
    ageCategory: {
      type: String,
      enum: ['18 - 20', '21 - 25', '26 - 30', '31 - 35', '36 - 40', '41 - 50', 'Above 50'],
      required: [true, 'Please specify your age category'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoommatePost', roommatePostSchema);
