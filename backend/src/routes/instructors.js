const express = require('express');
const {
    applyInstructor,
    getInstructorProfile,
    getDashboardStats,
    updateInstructorStatus,
    getInstructorApplications,
    getInstructors
} = require('../controllers/instructors');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Public/User routes
router.post('/apply', protect, applyInstructor);

// Instructor routes
router.get('/me', protect, getInstructorProfile);
router.get('/dashboard', protect, authorize('instructor', 'admin', 'super_admin'), getDashboardStats);

// Admin routes
router.get('/', protect, authorize('admin', 'super_admin'), getInstructors);
router.get('/applications', protect, authorize('admin', 'super_admin'), getInstructorApplications);
router.put('/:id/status', protect, authorize('admin', 'super_admin'), updateInstructorStatus);

module.exports = router;
