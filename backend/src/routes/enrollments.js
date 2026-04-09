const express = require('express');
const {
    enrollCourse,
    getMyEnrollments,
    updateProgress,
    getUserEnrollments // Added getUserEnrollments
} = require('../controllers/enrollments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth'); // Added authorize

router.use(protect); // All routes are protected

router.post('/:courseId', enrollCourse);
router.get('/me', getMyEnrollments);
router.put('/:courseId/progress', updateProgress);

// Admin routes
router.get('/user/:userId', authorize('admin', 'super_admin'), getUserEnrollments);

module.exports = router;
