const express = require('express');
const {
    getCourseProgress,
    completeLesson,
    updateWatchTime,
    getMyProgress
} = require('../controllers/progress');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/me', getMyProgress);
router.get('/:courseId', getCourseProgress);
router.post('/:courseId/lesson/:lessonId/complete', completeLesson);
router.post('/:courseId/lesson/:lessonId/watch', updateWatchTime);

module.exports = router;
