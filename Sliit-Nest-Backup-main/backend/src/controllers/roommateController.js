const RoommatePost = require('../models/RoommatePost');

// @desc    Create a new roommate post
// @route   POST /api/roommates
// @access  Protected
exports.createPost = async (req, res) => {
  try {
    const { bio, genderPreference, budgetRange, habits, location, whatsappNumber, ageCategory } = req.body;

    const post = await RoommatePost.create({
      user: req.user._id,
      bio,
      whatsappNumber,
      genderPreference,
      budgetRange,
      habits,
      location,
      ageCategory,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all roommate posts with optional filters
// @route   GET /api/roommates
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { gender, minBudget, maxBudget, location, nonSmoker, studyPreference, ageCategory } = req.query;
    
    // Build filter object
    let filter = { isActive: true };

    if (gender) {
      filter.genderPreference = { $in: [gender, 'Any'] };
    }
    
    if (ageCategory) {
      filter.ageCategory = ageCategory;
    }
    
    // Budget filter implementation - find overlapping ranges
    if (minBudget || maxBudget) {
      if (minBudget) filter['budgetRange.max'] = { $gte: parseInt(minBudget) };
      if (maxBudget) filter['budgetRange.min'] = { $lte: parseInt(maxBudget) };
    }

    if (location) filter.location = { $regex: location, $options: 'i' };
    
    if (nonSmoker !== undefined) filter['habits.nonSmoker'] = nonSmoker === 'true';
    if (studyPreference) filter['habits.studyPreference'] = studyPreference;

    const posts = await RoommatePost.find(filter)
      .populate('user', 'fullName email isVerified')
      .sort('-createdAt');

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/roommates/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await RoommatePost.findById(req.params.id)
      .populate('user', 'firstName lastName email isVerified');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const userId = req.user ? req.user._id.toString() : null;
    const p = post.toObject();
    if (!req.user || !req.user.isVerified) {
      // Only allow owner to bypass verification
      if (!(userId && p.user && p.user._id.toString() === userId)) {
        delete p.whatsappNumber;
      }
    }

    res.status(200).json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a roommate post
// @route   PATCH /api/roommates/:id
// @access  Protected
exports.updatePost = async (req, res) => {
  try {
    let post = await RoommatePost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure the post belongs to the user
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    post = await RoommatePost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all posts by the logged-in user
// @route   GET /api/roommates/mine
// @access  Protected
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await RoommatePost.find({ user: req.user._id })
      .sort('-createdAt');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a roommate post
// @route   DELETE /api/roommates/:id
// @access  Protected
exports.deletePost = async (req, res) => {
  try {
    const post = await RoommatePost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
