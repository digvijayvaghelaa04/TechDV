const express = require('express');
const router = express.Router();
const { getVideoToken, streamVideo, getVideoStream, updateProgress } = require('../controllers/stream');
const { protect } = require('../middleware/auth');

// All standard routes are JWT-protected
router.use(protect);

router.post('/token', getVideoToken);           // Get short-lived video token
router.get('/stream/:courseId/:lessonId', streamVideo); // Serve video via short-lived token (no JWT in URL)
router.get('/:courseId/:lessonId', getVideoStream); // Legacy: returns video URL
router.post('/progress', updateProgress);

module.exports = router;
