const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    lesson: {
        type: mongoose.Schema.ObjectId,
        ref: 'Lesson',
        required: true
    },
    questions: [{
        questionText: { type: String, required: true },
        options: [{
            text: String,
            isCorrect: Boolean
        }],
        points: { type: Number, default: 1 }
    }],
    passingScore: {
        type: Number, // Percentage
        default: 70
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
