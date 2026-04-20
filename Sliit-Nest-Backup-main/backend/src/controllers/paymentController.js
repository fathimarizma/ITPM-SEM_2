const Payment = require('../models/Payment');
const Listing = require('../models/Listing');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/payments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @desc    Create payment submission for existing listing
// @route   POST /api/payments
// @access  Private (Owner only)
exports.createPayment = async (req, res, next) => {
  try {
    const { listingId, paymentMethod, transactionId, amount, notes } = req.body;

    // Check if listing exists and belongs to user
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.ownerId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to make payment for this listing'
      });
    }

    // Check if payment already exists for this listing
    const existingPayment = await Payment.findOne({ 
      listingId, 
      status: 'pending' 
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already submitted for this listing'
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      listingId,
      paymentMethod,
      transactionId,
      amount,
      notes,
      paymentSlip: req.file.filename,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment submitted successfully. Your listing will remain active once approved.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (for admin)
// @route   GET /api/payments
// @access  Private (Admin only)
exports.getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address monthlyRent')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Filter out payments with missing user references
    const validPayments = payments.filter(payment => {
      if (!payment.user) {
        console.log('Filtering out payment with missing user:', payment._id);
        return false;
      }
      return true;
    });

    console.log('Valid payments found:', validPayments.length);
    validPayments.forEach(payment => {
      console.log('Payment user:', payment.user?.firstName, payment.user?.lastName);
    });

    res.status(200).json({
      success: true,
      count: validPayments.length,
      data: validPayments
    });
  } catch (error) {
    console.error('Error in getPayments:', error);
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private (Admin or payment owner)
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('listingId', 'title address monthlyRent')
      .populate('reviewedBy', 'firstName lastName');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is admin or payment owner
    if (req.user.role !== 'Admin' && payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve payment and update listing
// @route   PUT /api/payments/:id/approve
// @access  Private (Admin only)
exports.approvePayment = async (req, res, next) => {
  try {
    const { adminNotes } = req.body || {};
    console.log('Approving payment with ID:', req.params.id);
    console.log('Admin user:', req.user);
    console.log('Request body:', req.body);

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      console.log('Payment not found');
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    console.log('Payment found:', payment);

    if (payment.status !== 'pending') {
      console.log('Payment not pending:', payment.status);
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`
      });
    }

    // Update the listing payment status
    console.log('Updating listing payment status for listing ID:', payment.listingId);
    await Listing.findByIdAndUpdate(payment.listingId, {
      paymentStatus: 'paid',
      lastPaymentDate: new Date()
    });

    // Update payment status
    payment.status = 'approved';
    payment.adminNotes = adminNotes || 'Approved by admin';
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = new Date();
    await payment.save();

    console.log('Payment approved successfully');
    res.status(200).json({
      success: true,
      data: payment,
      message: 'Payment approved and listing updated successfully'
    });
  } catch (error) {
    console.error('Error in approvePayment:', error);
    next(error);
  }
};

// @desc    Reject payment
// @route   PUT /api/payments/:id/reject
// @access  Private (Admin only)
exports.rejectPayment = async (req, res, next) => {
  try {
    const { adminNotes } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Payment is already ${payment.status}`
      });
    }

    // Update payment status
    payment.status = 'rejected';
    payment.adminNotes = adminNotes || '';
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      data: payment,
      message: 'Payment rejected'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/user/payments
// @access  Private
exports.getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('listingId', 'title address monthlyRent')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's listings with trial status
// @route   GET /api/payments/user/trial-status
// @access  Private
exports.getUserTrialStatus = async (req, res, next) => {
  try {
    const listings = await Listing.find({ ownerId: req.user.id })
      .select('title trialExpiresAt paymentStatus')
      .sort({ createdAt: -1 });

    const listingsWithStatus = listings.map(listing => {
      const now = new Date();
      const trialExpired = listing.trialExpiresAt < now;
      const daysUntilExpiry = Math.ceil((listing.trialExpiresAt - now) / (1000 * 60 * 60 * 24));
      
      return {
        _id: listing._id,
        title: listing.title,
        trialExpiresAt: listing.trialExpiresAt,
        paymentStatus: listing.paymentStatus,
        isTrialExpired: trialExpired,
        daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
        needsPayment: trialExpired && listing.paymentStatus === 'trial'
      };
    });

    res.status(200).json({
      success: true,
      data: listingsWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End free trial for a listing (testing purposes)
// @route   POST /api/listings/:id/end-trial
// @access  Private (Owner only)
exports.endTrial = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.ownerId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this listing'
      });
    }

    if (listing.paymentStatus !== 'trial') {
      return res.status(400).json({
        success: false,
        message: 'Listing is not in trial period'
      });
    }

    // Set trial expiration to now (immediately expire)
    listing.trialExpiresAt = new Date();
    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Free trial ended successfully',
      data: {
        listingId: listing._id,
        trialExpiresAt: listing.trialExpiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Middleware for handling file upload
exports.uploadPaymentSlip = upload.single('paymentSlip');
