const Review = require('../models/Review');
const Course = require('../models/Course');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/courses/:courseId/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
    try {
        let query;

        if (req.params.courseId) {
            query = Review.find({ course: req.params.courseId });
        } else {
            query = Review.find();
        }

        const reviews = await query.populate({
            path: 'user',
            select: 'name avatar'
        });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Add review
// @route   POST /api/v1/courses/:courseId/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        req.body.course = req.params.courseId;
        req.body.user = req.user.id;

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
