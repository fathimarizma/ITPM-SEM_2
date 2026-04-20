const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Get all pending listings for admin approval
// @route   GET /api/admin/listings/pending
// @access  Private/Admin
exports.getPendingListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ status: 'Pending' })
      .populate('ownerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings for admin
// @route   GET /api/admin/listings
// @access  Private/Admin
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({})
      .populate('ownerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a listing
// @route   PUT /api/admin/listings/:id/approve
// @access  Private/Admin
exports.approveListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Listing is already ${listing.status.toLowerCase()}`
      });
    }

    listing.status = 'Approved';
    await listing.save();

    res.status(200).json({
      success: true,
      data: listing,
      message: 'Listing approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a listing
// @route   PUT /api/admin/listings/:id/reject
// @access  Private/Admin
exports.rejectListing = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Listing is already ${listing.status.toLowerCase()}`
      });
    }

    listing.status = 'Rejected';
    listing.adminNotes = reason || 'Rejected by admin';
    await listing.save();

    res.status(200).json({
      success: true,
      data: listing,
      message: 'Listing rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalListings = await Listing.countDocuments();
    const pendingListings = await Listing.countDocuments({ status: 'Pending' });
    const approvedListings = await Listing.countDocuments({ status: 'Approved' });
    const rejectedListings = await Listing.countDocuments({ status: 'Rejected' });
    const totalOwners = await User.countDocuments({ role: 'Owner' });
    const verifiedStudents = await User.countDocuments({ role: 'Student', isVerified: true });

    res.status(200).json({
      success: true,
      data: {
        totalListings,
        pendingListings,
        approvedListings,
        rejectedListings,
        totalOwners,
        verifiedStudents
      }
    });
  } catch (error) {
    next(error);
  }
};
