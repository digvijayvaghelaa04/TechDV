const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        course: {
            type: mongoose.Schema.ObjectId,
            ref: 'Course',
            required: true
        },
        title: String,
        thumbnail: String,
        price: Number,
        instructor: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    }],
    paymentInfo: {
        id: String, // Stripe Intent ID
        status: String,
        type: { type: String, default: 'stripe' },
        email: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    coupon: {
        code: String,
        discount: { type: Number, default: 0 }
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderStatus: {
        type: String,
        enum: ['Created', 'Processing', 'Paid', 'Failed', 'Refunded'],
        default: 'Created'
    },
    paidAt: Date,
    billingDetails: {
        name: String,
        email: String,
        address: {
            line1: String,
            city: String,
            postal_code: String,
            country: String
        }
    },
    invoiceId: String, // Reference to stored PDF
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
