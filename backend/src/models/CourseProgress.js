const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
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
    completedLessons: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Lesson'
        }
    ],
    lastWatchedLesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson'
    },
    progressPercentage: {
        type: Number,
        default: 0
    },
    watchHistory: [
        {
            lesson: {
                type: mongoose.Schema.ObjectId,
                ref: 'Lesson'
            },
            position: Number, // in seconds
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for performance
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);
