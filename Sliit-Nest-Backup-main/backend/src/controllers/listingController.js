const Listing = require('../models/Listing');

// @desc    Get all listings for logged in owner
// @route   GET /api/listings/my-listings
// @access  Private/Owner
exports.getOwnerListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Private/Owner
exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Check ownership
    if (String(listing.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this listing' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private/Owner
exports.createListing = async (req, res, next) => {
  try {
    // Add ownerId to req.body
    req.body.ownerId = req.user._id;
    // Force status to "Pending" initially
    req.body.status = 'Pending';

    // Process uploaded files if any
    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map(file => `/uploads/${file.filename}`);
    } else if (typeof req.body.photos === 'string') {
      req.body.photos = [req.body.photos]; // fallback
    }

    const listing = await Listing.create(req.body);
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(400); // Bad Request typically for Validation errors
    next(error);
  }
};

// @desc    Update listing
// @route   PATCH /api/listings/:id
// @access  Private/Owner
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Ensure owner
    if (String(listing.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Handle photos array combining existing photos and new uploads
    let finalPhotos = [];
    if (req.body.existingPhotos) {
      if (Array.isArray(req.body.existingPhotos)) {
        finalPhotos = req.body.existingPhotos;
      } else {
        finalPhotos = [req.body.existingPhotos];
      }
    }

    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
      finalPhotos = [...finalPhotos, ...newPhotos];
    }

    // Only update photos if either existingPhotos or files were provided,
    // otherwise the front-end might just want to keep the old ones if it didn't send them,
    // but typically a form-data request sends the state.
    if (finalPhotos.length > 0) {
      req.body.photos = finalPhotos;
    } else if (req.body.existingPhotos === '') {
      // Allow clearing all photos if explicitly sent as empty
      req.body.photos = [];
    }

    // Update
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private/Owner
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Ensure owner
    if (String(listing.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400);
    next(error);
  }
};
