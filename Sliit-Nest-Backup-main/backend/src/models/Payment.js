const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    listingId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Listing',
      required: true
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['bank_transfer', 'online_banking', 'mobile_payment', 'cash_deposit']
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0']
    },
    notes: {
      type: String,
      default: ''
    },
    paymentSlip: {
      type: String,
      required: [true, 'Payment slip is required']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
