const express = require('express');
const {
    getReviews,
    addReview
} = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getReviews)
    .post(protect, authorize('student', 'admin'), addReview);

module.exports = router;
