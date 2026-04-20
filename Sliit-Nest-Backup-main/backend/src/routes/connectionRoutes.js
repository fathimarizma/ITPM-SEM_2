const express = require('express');
const router = express.Router();
const {
  sendConnectionRequest,
  getMyRequests,
  respondToRequest,
  getMyMatches,
  getConnectionStatus
} = require('../controllers/connectionController');

// Using existing auth middleware if we assume it exists (usually placed in ../middlewares/authMiddleware.js)
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/send', sendConnectionRequest);
router.get('/my-requests', getMyRequests);
router.put('/respond', respondToRequest);
router.get('/my-matches', getMyMatches);
router.get('/status/:userId/:postId', getConnectionStatus);

module.exports = router;
