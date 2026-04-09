const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// @desc    Get course progress for a user
// @route   GET /api/v1/progress/:courseId
// @access  Private
exports.getCourseProgress = async (req, res) => {
    try {
        let progress = await CourseProgress.findOne({
            user: req.user.id,
            course: req.params.courseId
        });

        if (!progress) {
            return res.status(200).json({
                success: true,
                data: {
                    progressPercentage: 0,
                    completedLessons: [],
                    lastWatchedLesson: null
                }
            });
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Mark a lesson as completed
// @route   POST /api/v1/progress/:courseId/lesson/:lessonId/complete
// @access  Private
exports.completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;

        // Find or create progress document
        let progress = await CourseProgress.findOne({
            user: req.user.id,
            course: courseId
        });

        if (!progress) {
            progress = new CourseProgress({
                user: req.user.id,
                course: courseId,
                completedLessons: []
            });
        }

        // Add to completed if not already there
        if (!progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);

            // Calculate new percentage
            // We need the total number of lessons in the course
            const course = await Course.findById(courseId).populate({
                path: 'modules',
                populate: { path: 'lessons' }
            });

            if (course) {
                let totalLessons = 0;
                course.modules.forEach(m => {
                    totalLessons += m.lessons.length;
                });

                if (totalLessons > 0) {
                    progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
                }

                if (progress.progressPercentage === 100 && !progress.completedAt) {
                    progress.completedAt = Date.now();
                }

                // Sync with Enrollment model for easy listing
                await Enrollment.findOneAndUpdate(
                    { user: req.user.id, course: courseId },
                    {
                        progress: progress.progressPercentage,
                        isCompleted: progress.progressPercentage === 100,
                        completedAt: progress.completedAt
                    }
                );
            }
        }

        progress.lastWatchedLesson = lessonId;
        await progress.save();

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update video watch time/position
// @route   POST /api/v1/progress/:courseId/lesson/:lessonId/watch
// @access  Private
exports.updateWatchTime = async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const { position } = req.body; // position in seconds

        let progress = await CourseProgress.findOne({
            user: req.user.id,
            course: courseId
        });

        if (!progress) {
            progress = new CourseProgress({
                user: req.user.id,
                course: courseId,
                completedLessons: []
            });
        }

        // Update last watched lesson
        progress.lastWatchedLesson = lessonId;

        // Update watch history for this lesson or add new one
        const historyIndex = progress.watchHistory.findIndex(h => h.lesson.toString() === lessonId);
        if (historyIndex > -1) {
            progress.watchHistory[historyIndex].position = position;
            progress.watchHistory[historyIndex].timestamp = Date.now();
        } else {
            progress.watchHistory.push({
                lesson: lessonId,
                position,
                timestamp: Date.now()
            });
        }

        await progress.save();

        res.status(200).json({
            success: true,
            data: {
                lastWatchedLesson: lessonId,
                position
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all user progress (for My Courses page)
// @route   GET /api/v1/progress/me
// @access  Private
exports.getMyProgress = async (req, res) => {
    try {
        const progress = await CourseProgress.find({ user: req.user.id });
        res.status(200).json({
            success: true,
            count: progress.length,
            data: progress
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
