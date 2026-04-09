const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// @desc    Enroll in a course
// @route   POST /api/v1/enrollments/:courseId
// @access  Private
exports.enrollCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            user: req.user.id,
            course: req.params.courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({ success: false, error: 'Already enrolled' });
        }

        // Free course logic here (for MVP we assume free or handled by Order)
        const enrollment = await Enrollment.create({
            user: req.user.id,
            course: req.params.courseId
        });

        course.totalEnrollments += 1;
        await course.save();

        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/v1/enrollments/me
// @access  Private
exports.getMyEnrollments = async (req, res, next) => {
    try {
        console.log(`[SYSTEM] Signal received: Fetching enrollments for architect ${req.user.id}`);

        const enrollments = await Enrollment.find({ user: req.user.id })
            .populate({
                path: 'course',
                select: 'title thumbnail instructor price level averageRating totalReviews estimatedDuration',
                populate: {
                    path: 'instructor',
                    select: 'firstName lastName avatar education'
                }
            })
            .lean();

        // Data Integrity Check: Filter out enrollments where course data is missing (e.g., deleted course)
        const validEnrollments = enrollments.filter(e => e.course);

        if (enrollments.length !== validEnrollments.length) {
            console.warn(`[SYSTEM] Alert: ${enrollments.length - validEnrollments.length} corrupted signals detected and filtered.`);
        }

        res.status(200).json({
            success: true,
            count: validEnrollments.length,
            data: validEnrollments
        });
    } catch (err) {
        console.error(`[SYSTEM] Internal Protocol Failure: ${err.message}`);
        res.status(400).json({ success: false, error: "Internal protocol failure. Signal lost." });
    }
};

// @desc    Update progress
// @route   PUT /api/v1/enrollments/:courseId/progress
// @access  Private
exports.updateProgress = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { lessonId, status, lastWatchedPosition } = req.body;
        const courseId = req.params.courseId;

        // 1. Update/Create individual Lesson Progress
        let progress = await Progress.findOne({
            user: req.user.id,
            lesson: lessonId
        }).session(session);

        if (!progress) {
            const newProgressObj = await Progress.create([{
                user: req.user.id,
                course: courseId,
                lesson: lessonId,
                status,
                lastWatchedPosition
            }], { session });
            progress = newProgressObj[0];
        } else {
            progress.status = status || progress.status;
            progress.lastWatchedPosition = lastWatchedPosition || progress.lastWatchedPosition;
            await progress.save({ session });
        }

        // 2. Sync with Enrollment record
        if (status === 'completed') {
            const enrollment = await Enrollment.findOne({
                user: req.user.id,
                course: courseId
            }).session(session);

            if (enrollment) {
                // Add lesson to completedLessons if not already there
                if (!enrollment.completedLessons.includes(lessonId)) {
                    enrollment.completedLessons.push(lessonId);

                    // Recalculate overall progress
                    const Lesson = require('../models/Lesson');
                    const totalLessons = await Lesson.countDocuments({ course: courseId }).session(session);

                    if (totalLessons > 0) {
                        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
                    }

                    if (enrollment.progress === 100) {
                        enrollment.isCompleted = true;
                        enrollment.completedAt = Date.now();
                    }

                    await enrollment.save({ session });
                }
            }
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ success: false, error: err.message });
    } finally {
        session.endSession();
    }
};

// @desc    Get enrollments for a specific user (Admin only)
// @route   GET /api/v1/enrollments/user/:userId
// @access  Private/Admin
exports.getUserEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ user: req.params.userId })
            .populate({
                path: 'course',
                select: 'title thumbnail price category'
            })
            .lean();

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
