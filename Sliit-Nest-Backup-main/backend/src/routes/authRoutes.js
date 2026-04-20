const express = require('express');
const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  resendVerificationCode
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verifyemail', verifyEmail);
router.post('/resendcode', resendVerificationCode);
router.get('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateProfile);

module.exports = router;
