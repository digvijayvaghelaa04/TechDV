const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
    order: {
        type: mongoose.Schema.ObjectId,
        ref: 'Order'
    },
    progress: {
        type: Number, // 0 to 100 percentage
        default: 0
    },
    completedLessons: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson'
    }],
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent update duplicate enrollment
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
