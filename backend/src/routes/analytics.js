const express = require('express');
const { getAdminAnalytics, getInstructorAnalytics, getPublicStats, getPlatformStats } = require('../controllers/analytics');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/public', getPublicStats);
router.get('/stats', getPlatformStats);

// Protected routes
router.use(protect);

router.get('/admin', authorize('admin', 'super_admin'), getAdminAnalytics);
router.get('/instructor', authorize('instructor', 'admin', 'super_admin'), getInstructorAnalytics);

module.exports = router;
