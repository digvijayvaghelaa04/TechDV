const express = require('express');
const {
    getLessons,
    createLesson,
    updateLesson,
    deleteLesson
} = require('../controllers/lessons');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getLessons)
    .post(protect, authorize('instructor', 'admin', 'super_admin'), createLesson);

router
    .route('/:id')
    .put(protect, authorize('instructor', 'admin', 'super_admin'), updateLesson)
    .delete(protect, authorize('instructor', 'admin', 'super_admin'), deleteLesson);

module.exports = router;
