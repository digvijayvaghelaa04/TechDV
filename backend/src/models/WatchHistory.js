const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema({
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
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
        required: true
    },
    lastPosition: {
        type: Number, // Timestamp in seconds
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    progressPercent: {
        type: Number,
        default: 0
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure one record per user-lesson
watchHistorySchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);
