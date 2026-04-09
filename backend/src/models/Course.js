const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [5000, 'Description cannot be more than 5000 characters']
    },
    thumbnail: {
        type: String,
        default: 'no-photo.jpg'
    },
    promoVideo: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        default: 0
    },
    discountedPrice: Number,
    estimatedDuration: Number, // in minutes
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'All Levels'
    },
    category: {
        type: String,
        required: true
    },
    tags: [String],
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    averageRating: {
        type: Number,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating must can not be more than 5'],
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalEnrollments: {
        type: Number,
        default: 0
    },
    modules: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Module'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    }
});

// Optimized compound indexes for common query patterns
courseSchema.index({ title: 'text', description: 'text', category: 1 });
courseSchema.index({ isPublished: 1, category: 1, level: 1 }); // Catalog browsing
courseSchema.index({ instructor: 1, isPublished: 1 });           // Instructor dashboard
courseSchema.index({ createdAt: -1, isPublished: 1 });           // Latest published courses
courseSchema.index({ totalEnrollments: -1 });                    // Popular courses

// Create course slug from the title
courseSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

module.exports = mongoose.model('Course', courseSchema);
