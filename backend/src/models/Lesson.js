const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a lesson title']
    },
    module: {
        type: mongoose.Schema.ObjectId,
        ref: 'Module',
        required: true
    },
    course: {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'article', 'quiz', 'pdf', 'assignment'],
        default: 'video'
    },
    content: String, // Text content or instruction
    videoUrl: String, // External URL or Cloudinary ID
    videoDuration: Number, // in seconds
    quizQuestions: [
        {
            question: String,
            options: [String],
            correctAnswer: Number, // Index of correct option
            explanation: String
        }
    ],
    resources: [{
        title: String,
        url: String
    }],
    isFreePreview: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lesson', lessonSchema);
