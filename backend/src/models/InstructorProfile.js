const mongoose = require('mongoose');

const instructorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot be more than 1000 characters']
    },
    expertise: [String],
    socialLinks: {
        linkedin: String,
        twitter: String,
        website: String,
        youtube: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    paymentDetails: {
        paypalEmail: String,
        bankAccount: {
            accountNumber: String,
            bankName: String,
            holderName: String
        }
    },
    metrics: {
        totalStudents: {
            type: Number,
            default: 0
        },
        totalCourses: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        }
    },
    lifetimeEarnings: {
        type: Number,
        default: 0
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('InstructorProfile', instructorProfileSchema);
