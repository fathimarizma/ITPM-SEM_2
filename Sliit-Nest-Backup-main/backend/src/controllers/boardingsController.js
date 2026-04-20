const Listing = require('../models/Listing');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all approved boardings (searchable)
// @route   GET /api/boardings
// @access  Public
exports.getApprovedBoardings = async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, type, capacity, facilities, rating } = req.query;

    let query = { status: 'Approved' };

    // Text search (Title or Address)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Price filtering
    if (minPrice || maxPrice) {
      query.monthlyRent = {};
      if (minPrice) query.monthlyRent.$gte = Number(minPrice);
      if (maxPrice) query.monthlyRent.$lte = Number(maxPrice);
    }

    // Accommodation type
    if (type) {
      // Type can be comma separated
      const types = type.split(',');
      query.accommodationType = { $in: types };
    }

    // Capacity
    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    // Facilities (must have all specified facilities)
    // If frontend sends facilities=WiFi,AC
    if (facilities) {
      const facilityArray = facilities.split(',');
      query.facilities = { $all: facilityArray };
    }

    // Minimum Rating
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    const listings = await Listing.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review for a boarding
// @route   POST /api/boardings/:id/reviews
// @access  Private (Student only)
exports.addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const listingId = req.params.id;
    const studentId = req.user._id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Can only review approved listings' });
    }

    // Optional: Only one review per student per listing
    const existingReview = await Review.findOne({ listingId, studentId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this boarding' });
    }

    const review = await Review.create({
      listingId,
      studentId,
      rating: Number(rating),
      comment
    });

    // Recalculate average rating
    const reviews = await Review.find({ listingId });
    const avg = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    listing.averageRating = avg.toFixed(1);
    listing.reviewCount = reviews.length;
    await listing.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a boarding
// @route   GET /api/boardings/:id/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const reviews = await Review.find({ listingId }).populate('studentId', 'firstName lastName').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment view count for a boarding
// @route   POST /api/boardings/:id/views
// @access  Public
exports.incrementViewCount = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    // We increment viewCount by 1 and return the updated listing (with new viewCount)
    const listing = await Listing.findByIdAndUpdate(listingId, { $inc: { viewCount: 1 } }, { new: true, runValidators: false });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    
    res.status(200).json({ success: true, data: { viewCount: listing.viewCount } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark for a boarding
// @route   POST /api/boardings/:id/bookmark
// @access  Private/Student
exports.toggleBookmark = async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const isBookmarked = user.bookmarks.includes(listingId);

    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== listingId.toString());
    } else {
      // Add bookmark
      user.bookmarks.push(listingId);
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ 
      success: true, 
      message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
      isBookmarked: !isBookmarked,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked boardings
// @route   GET /api/boardings/saved
// @access  Private/Student
exports.getSavedBoardings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarks',
      match: { status: 'Approved' } // Optional: only return approved ones
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter out any nulls in case a bookmarked listing was deleted
    const validBookmarks = user.bookmarks.filter(b => b != null);

    res.status(200).json({ 
      success: true, 
      count: validBookmarks.length,
      data: validBookmarks 
    });
  } catch (error) {
    next(error);
  }
};
