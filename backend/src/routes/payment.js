const express = require('express');
const {
    processPayment,
    sendStripeApiKey,
    stripeWebhook,
    verifyRazorpayPayment
} = require('../controllers/payment');

const {
    createPayment,
    getMyPayments,
    getAllPayments,
    approvePayment,
    rejectPayment
} = require('../controllers/paymentController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Existing Routes
router.post('/process', protect, processPayment);
router.post('/verify-razorpay', protect, verifyRazorpayPayment);
router.get('/stripeapi', protect, sendStripeApiKey);

// UPI Payment Routes
router.post('/create', protect, createPayment);
router.get('/my-payments', protect, getMyPayments);

// Admin Payment Routes
router.get('/admin/all', protect, authorize('admin', 'super_admin'), getAllPayments);
router.put('/admin/:id/approve', protect, authorize('admin', 'super_admin'), approvePayment);
router.put('/admin/:id/reject', protect, authorize('admin', 'super_admin'), rejectPayment);

// Webhook endpoint
router.post('/webhook', stripeWebhook);

module.exports = router;
