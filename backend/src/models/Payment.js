const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    courseName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionId: {
        type: String,
        required: [true, 'Please add transaction ID'],
        unique: true
    },
    upiId: {
        type: String,
        default: 'DV7353@OKSBI'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed', 'rejected'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        default: 'UPI'
    },
    screenshot: {
        type: String // URL to uploaded screenshot
    },
    date: {
        type: String, // Stored as formatted string if needed, but createdAt is better
    },
    time: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate date and time before saving
paymentSchema.pre('save', function (next) {
    const now = new Date();
    if (!this.date) {
        this.date = now.toLocaleDateString();
    }
    if (!this.time) {
        this.time = now.toLocaleTimeString();
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
