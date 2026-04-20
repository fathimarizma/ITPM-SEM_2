const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      maxlength: [20, 'First name can not be more than 20 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      maxlength: [20, 'Last name can not be more than 20 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please add a phone number'],
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
      maxlength: [50, 'Address can not be more than 50 characters'],
    },
    gender: {
      type: String,
      required: [true, 'Please specify gender'],
      enum: ['Male', 'Female'],
    },
    age: {
      type: Number,
      required: [true, 'Please specify age'],
      min: [10, 'Age must be at least 10'],
      max: [100, 'Age must be at most 100'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      validate: {
        validator: function(v) {
          if (this.role === 'Student') {
            return /^[a-zA-Z0-9._%+-]+@(my\.)?sliit\.lk$/.test(v);
          }
          // Just a standard syntax check for other roles
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address depending on your role',
      },
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['Student', 'Owner', 'Admin'],
      required: [true, 'Please specify a role'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    bookmarks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    }],
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
