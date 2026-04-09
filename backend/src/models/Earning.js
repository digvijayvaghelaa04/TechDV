const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['sale', 'payout', 'refund', 'bonus'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    source: {
        courseId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Course'
        },
        orderId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Order'
        },
        transactionId: String // For payouts
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Earning', earningSchema);
