const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const {
  getPendingListings,
  getAllListings,
  approveListing,
  rejectListing,
  getAdminStats
} = require('../controllers/adminController');

// All routes here are protected and restricted to "Admin" role
router.use(protect, restrictTo('Admin'));

// Stats
router.get('/stats', getAdminStats);

// Listings management
router.get('/listings', getAllListings);
router.get('/listings/pending', getPendingListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/reject', rejectListing);

module.exports = router;
