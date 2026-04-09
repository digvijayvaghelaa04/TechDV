const { asyncHandler, AppError } = require('../utils/errorHandler');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const User = require('../models/User');

// @desc    Upload Image (Generic)
// @route   POST /api/v1/upload/image
// @access  Private
exports.uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    // Determine folder based on query param or default
    const folder = req.query.folder || 'general';

    const result = await uploadOnCloudinary(req.file.path, folder);
    let imageUrl;

    if (result) {
        imageUrl = result.secure_url;
    } else {
        const protocol = req.protocol;
        const host = req.get('host');
        imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    res.status(200).json({
        success: true,
        data: {
            url: imageUrl,
            public_id: result ? result.public_id : null
        }
    });
});

// @desc    Upload User Avatar
// @route   POST /api/v1/upload/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    let avatarUrl;
    const result = await uploadOnCloudinary(req.file.path, 'avatars');

    if (result) {
        avatarUrl = result.secure_url;
    } else {
        // Fallback to local storage URL if Cloudinary is not configured
        // We need to construct the URL based on the current request protocol and host
        const protocol = req.protocol;
        const host = req.get('host');
        avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    // Update User Profile Immediately
    await User.findByIdAndUpdate(req.user.id, {
        avatar: avatarUrl
    });

    res.status(200).json({
        success: true,
        message: 'Avatar updated successfully',
        data: {
            avatar: avatarUrl
        }
    });
});

// @desc    Upload Video
// @route   POST /api/v1/upload/video
// @access  Private (Instructor Only)
exports.uploadVideo = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }

    const result = await uploadOnCloudinary(req.file.path, 'courses/videos');
    let videoUrl;

    if (result) {
        videoUrl = result.secure_url;
    } else {
        const protocol = req.protocol;
        const host = req.get('host');
        videoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    res.status(200).json({
        success: true,
        data: {
            url: videoUrl,
            duration: result ? result.duration : 0,
            format: result ? result.format : 'mp4',
            public_id: result ? result.public_id : null
        }
    });
});

// @desc    Upload Document/PDF
// @route   POST /api/v1/upload/document
// @access  Private (Instructor/Admin)
exports.uploadDocument = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        throw new AppError('No document uploaded', 400);
    }

    const result = await uploadOnCloudinary(req.file.path, 'courses/documents');
    let docUrl;

    if (result) {
        docUrl = result.secure_url;
    } else {
        const protocol = req.protocol;
        const host = req.get('host');
        docUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    res.status(200).json({
        success: true,
        data: {
            url: docUrl,
            format: result ? result.format : 'pdf',
            public_id: result ? result.public_id : null
        }
    });
});
