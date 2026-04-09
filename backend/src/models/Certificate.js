const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
    enrollment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Enrollment',
        required: true
    },
    certificateId: {
        type: String,
        unique: true,
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    pdfUrl: String
});

module.exports = mongoose.model('Certificate', certificateSchema);
