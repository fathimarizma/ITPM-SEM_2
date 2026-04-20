const express = require('express');
const router = express.Router();
const boardingsController = require('../controllers/boardingsController');
const { protect, protectOptional, restrictTo } = require('../middlewares/authMiddleware');

// Public search/filter route
router.route('/')
  .get(protectOptional, boardingsController.getApprovedBoardings);

// Reviews routes
router.route('/:id/reviews')
  .get(protectOptional, boardingsController.getReviews)
  .post(protect, restrictTo('Student'), boardingsController.addReview);

// Bookmarks routes
router.get('/saved/bookmarks', protect, restrictTo('Student'), boardingsController.getSavedBoardings);
router.post('/:id/bookmark', protect, restrictTo('Student'), boardingsController.toggleBookmark);

// View count
router.post('/:id/views', boardingsController.incrementViewCount);

module.exports = router;
