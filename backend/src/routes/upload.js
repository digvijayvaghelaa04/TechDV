const express = require('express');
const router = express.Router();
const { uploadImage, uploadAvatar, uploadVideo, uploadDocument } = require('../controllers/upload');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All upload routes require authentication
router.use(protect);

// Single Image Upload (Generic)
router.post('/image', upload.single('image'), uploadImage);

// Avatar Upload (Key must be 'avatar')
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// Video Upload (Instructors/Admins - Key must be 'video')
router.post('/video', authorize('instructor', 'admin', 'super_admin'), upload.single('video'), uploadVideo);

// Document Upload
router.post('/document', authorize('instructor', 'admin', 'super_admin'), upload.single('document'), uploadDocument);

module.exports = router;
