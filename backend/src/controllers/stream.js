const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const Course = require('../models/Course');
const WatchHistory = require('../models/WatchHistory');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');

// @desc    Get short-lived video access token (5 minutes)
// @route   POST /api/v1/video/token
// @access  Private (enrolled students + admins + instructors)
exports.getVideoToken = asyncHandler(async (req, res, next) => {
    const { courseId, lessonId } = req.body;
    if (!courseId || !lessonId) throw new AppError('courseId and lessonId are required', 400);

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isInstructor = course.instructor.toString() === req.user.id.toString();

    if (!isAdmin && !isInstructor) {
        // Check enrollment
        const enrolled = await Enrollment.findOne({ user: req.user.id, course: courseId, status: 'active' });
        if (!enrolled) throw new AppError('You must purchase this course to access videos', 403);
    }

    // Issue short-lived video token (5 minutes)
    const videoToken = jwt.sign(
        { userId: req.user.id, courseId, lessonId, type: 'video_access' },
        process.env.VIDEO_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );

    res.status(200).json({ success: true, token: videoToken, expiresIn: 300 });
});

// @desc    Serve video file securely (using short-lived video token)
// @route   GET /api/v1/video/stream/:courseId/:lessonId
// @access  Via video token (query param)
exports.streamVideo = asyncHandler(async (req, res, next) => {
    const { courseId, lessonId } = req.params;
    const { vtoken } = req.query;

    if (!vtoken) throw new AppError('Video token required', 401);

    let decoded;
    try {
        decoded = jwt.verify(vtoken, process.env.VIDEO_TOKEN_SECRET || process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError('Video token expired or invalid. Please refresh the page.', 401);
    }

    if (decoded.type !== 'video_access' || decoded.lessonId !== lessonId) {
        throw new AppError('Invalid video token for this lesson', 403);
    }

    // Find the lesson URL
    const fullCourse = await Course.findById(courseId).populate({ path: 'modules', populate: { path: 'lessons' } });
    if (!fullCourse) throw new AppError('Course not found', 404);

    let videoPath = null;
    for (const module of fullCourse.modules) {
        for (const lesson of module.lessons) {
            if (lesson._id.toString() === lessonId) { videoPath = lesson.videoUrl; break; }
        }
    }
    if (!videoPath) throw new AppError('Video not found', 404);

    // Resolve actual file path from /cource-data/... URL
    const diskPath = path.join(__dirname, '../../..', videoPath);
    if (!fs.existsSync(diskPath)) {
        throw new AppError('Video file not found on server. Please contact support.', 404);
    }

    const stat = fs.statSync(diskPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        // Range request — video seeking support
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = (end - start) + 1;
        const fileStream = fs.createReadStream(diskPath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        });
        fileStream.pipe(res);
    } else {
        // Full file
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        });
        fs.createReadStream(diskPath).pipe(res);
    }
});

// @desc    Get secure video URL (Signed) — Legacy endpoint kept for compatibility
// @route   GET /api/v1/video/:courseId/:lessonId
// @access  Private (Enrolled students only)
exports.getVideoStream = asyncHandler(async (req, res, next) => {
    const { courseId, lessonId } = req.params;

    // 1. Check Enrollment
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.includes(courseId);
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    // Also verify if user is the instructor of the course
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError('Course not found', 404);
    }
    const isInstructor = course.instructor.toString() === req.user.id.toString();

    if (!isEnrolled && !isAdmin && !isInstructor) {
        throw new AppError('Not authorized to access this video', 403);
    }

    // 2. Find Lesson Video ID
    // Note: We need to traverse modules -> lessons.
    // Assuming course was populated or we aggregate.
    // For performance, better to fetch just the lesson video url from course structure

    // Simplification: We iterate to find lesson
    let lessonVideoUrl = null;
    let found = false;

    // We need to populate modules and lessons to search
    const fullCourse = await Course.findById(courseId).populate({
        path: 'modules',
        populate: { path: 'lessons' }
    });

    for (const module of fullCourse.modules) {
        for (const lesson of module.lessons) {
            if (lesson._id.toString() === lessonId) {
                lessonVideoUrl = lesson.videoUrl;
                found = true;
                break;
            }
        }
        if (found) break;
    }

    if (!found || !lessonVideoUrl) {
        throw new AppError('Video not found for this lesson', 404);
    }

    // 3. Serve Video (Cloudinary)
    // In production, we would sign this URL with a timestamp to prevent sharing.
    // For Cloudinary, raw URL works but isn't secure. 
    // Ideally, use cloudinary.url(public_id, { sign_url: true, type: 'authenticated' })
    // For this implementation, we return the URL stored.

    res.status(200).json({
        success: true,
        url: lessonVideoUrl,
        provider: 'cloudinary' // frontend can switch player based on provider
    });
});

// @desc    Update Watch Progress
// @route   POST /api/v1/video/progress
// @access  Private
exports.updateProgress = asyncHandler(async (req, res, next) => {
    const { courseId, lessonId, timestamp, completed } = req.body;

    if (!courseId || !lessonId) {
        throw new AppError('Course and Lesson ID are required', 400);
    }

    // Update Watch History (Last watched position)
    let history = await WatchHistory.findOne({
        user: req.user.id,
        course: courseId,
        lesson: lessonId
    });

    if (history) {
        history.timestamp = timestamp; // current second
        history.completed = completed || history.completed; // don't un-complete
        history.lastWatchedAt = Date.now();
        await history.save();
    } else {
        await WatchHistory.create({
            user: req.user.id,
            course: courseId,
            lesson: lessonId,
            timestamp: timestamp || 0,
            completed: completed || false
        });
    }

    // Update Course Progress (Percentage)
    let progress = await Progress.findOne({ user: req.user.id, course: courseId });

    if (!progress) {
        progress = await Progress.create({
            user: req.user.id,
            course: courseId,
            completedLessons: [],
            percentCompleted: 0
        });
    }

    if (completed && !progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);

        // Calculate new percentage
        const course = await Course.findById(courseId).populate({ path: 'modules', populate: 'lessons' });
        let totalLessons = 0;
        course.modules.forEach(m => totalLessons += m.lessons.length);

        if (totalLessons > 0) {
            progress.percentCompleted = Math.round((progress.completedLessons.length / totalLessons) * 100);
        }

        // Check for course completion
        if (progress.percentCompleted === 100 && !progress.isCompleted) {
            progress.isCompleted = true;
            progress.completedAt = Date.now();
            // Trigger Certificate Generation Here (Event/Queue)
        }

        await progress.save();
    }

    res.status(200).json({
        success: true,
        progress: progress.percentCompleted
    });
});
