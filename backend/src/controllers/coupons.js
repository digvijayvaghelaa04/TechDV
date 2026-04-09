const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// @desc    Apply Coupon to Cart
// @route   POST /api/v1/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res, next) => {
    try {
        const { couponCode, courseIds, totalAmount } = req.body; // courseIds to check applicability

        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Invalid coupon code' });
        }

        // Validity Checks
        if (!coupon.isValid(req.user.id, totalAmount)) {
            return res.status(400).json({ success: false, error: 'Coupon is not valid for this purchase' });
        }

        // Calculate Discount
        const discountAmount = coupon.calculateDiscount(totalAmount);
        const newTotal = totalAmount - discountAmount;

        res.status(200).json({
            success: true,
            discount: discountAmount,
            newTotal,
            couponCode: coupon.code
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create Coupon (Admin/Instructor)
// @route   POST /api/v1/coupons
// @access  Private (Admin/Instructor)
exports.createCoupon = async (req, res, next) => {
    try {
        // If instructor, can only create for own courses (TODO: Add validation)

        const coupon = await Coupon.create(req.body);

        res.status(201).json({
            success: true,
            data: coupon
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/v1/coupons
// @access  Private (Admin)
exports.getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
