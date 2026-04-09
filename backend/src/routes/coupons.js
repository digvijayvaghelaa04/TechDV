const express = require('express');
const {
    applyCoupon,
    createCoupon,
    getCoupons
} = require('../controllers/coupons');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.post('/apply', protect, applyCoupon);
router.use(protect);
router.use(authorize('admin', 'instructor', 'super_admin'));
router.route('/').get(getCoupons).post(createCoupon);

module.exports = router;
