const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoommatePost',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending/accepted connection requests for the same post between the same users
connectionSchema.index({ sender: 1, receiver: 1, post: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
