const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    minPurchaseAmount: {
        type: Number,
        default: 0
    },
    maxDiscountAmount: Number, // For percentage coupons
    startDate: {
        type: Date,
        default: Date.now
    },
    expirationDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number, // Total times coupon can be used
        default: null
    },
    usageCount: {
        type: Number,
        default: 0
    },
    usersUsed: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCourses: [{ // If empty, applies to all
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    }]
}, { timestamps: true });

// Check if coupon is valid for a user and amount
couponSchema.methods.isValid = function (userId, amount) {
    const now = new Date();
    if (!this.isActive) return false;
    if (this.expirationDate < now) return false;
    if (this.startDate > now) return false;
    if (this.minPurchaseAmount > amount) return false;
    if (this.usageLimit && this.usageCount >= this.usageLimit) return false;
    if (this.usersUsed.includes(userId)) return false; // One per user
    return true;
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (amount) {
    let discount = 0;
    if (this.type === 'percentage') {
        discount = (amount * this.value) / 100;
        if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
            discount = this.maxDiscountAmount;
        }
    } else {
        discount = this.value;
    }
    return Math.min(discount, amount); // Cannot exceed total amount
};

module.exports = mongoose.model('Coupon', couponSchema);
