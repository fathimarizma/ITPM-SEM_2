const express = require('express');
const { protect, restrictTo } = require('../middlewares/authMiddleware');
const {
  createPayment,
  getPayments,
  getPayment,
  approvePayment,
  rejectPayment,
  getUserPayments,
  getUserTrialStatus,
  uploadPaymentSlip
} = require('../controllers/paymentController');

const router = express.Router();

router.post('/', protect, restrictTo('Owner'), uploadPaymentSlip, createPayment);
router.get('/', protect, restrictTo('Admin'), getPayments);
router.get('/user/payments', protect, getUserPayments);
router.get('/user/trial-status', protect, getUserTrialStatus);
router.get('/:id', protect, getPayment);
router.put('/:id/approve', protect, restrictTo('Admin'), approvePayment);
router.put('/:id/reject', protect, restrictTo('Admin'), rejectPayment);

module.exports = router;
