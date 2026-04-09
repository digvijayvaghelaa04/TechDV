const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const InstructorProfile = require('../models/InstructorProfile');

// @desc    Get Super Admin Analytics
// @route   GET /api/v1/analytics/admin
// @access  Private (Super Admin)
exports.getAdminAnalytics = async (req, res, next) => {
    try {
        // 1. Total Revenue (All time)
        const totalRevenue = await Order.aggregate([
            { $match: { orderStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        // 2. User Stats
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });

        // 3. Revenue Chart Data (Last 12 months)
        const revenueChart = await Order.aggregate([
            { $match: { orderStatus: 'Paid' } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    amount: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
        ]);

        // 4. Top Performing Courses (by Revenue)
        const topCourses = await Course.find()
            .sort({ totalEnrollments: -1 })
            .limit(5)
            .select('title totalEnrollments averageRating price');

        res.status(200).json({
            success: true,
            data: {
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    chart: revenueChart
                },
                users: {
                    total: totalUsers,
                    instructors: totalInstructors
                },
                topCourses
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Instructor Analytics
// @route   GET /api/v1/analytics/instructor
// @access  Private (Instructor)
exports.getInstructorAnalytics = async (req, res, next) => {
    try {
        const instructorId = req.user.id;

        // 1. Earnings Chart (Daily for last 30 days)
        const Earning = require('../models/Earning');

        const earningsChart = await Earning.aggregate([
            { $match: { instructor: req.user._id, type: 'sale' } },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$createdAt" },
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
            { $limit: 30 }
        ]);

        // 2. Course Performance breakdown
        const courses = await Course.find({ instructor: instructorId })
            .select('title totalEnrollments averageRating totalReviews');

        res.status(200).json({
            success: true,
            data: {
                earningsChart,
                courseStats: courses
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Public/Platform Stats
// @route   GET /api/v1/analytics/public OR /stats
// @access  Public
const getPublicStats = async (req, res, next) => {
    try {
        const totalLearners = await User.countDocuments({ role: 'user' });
        const totalCourses = await Course.countDocuments({ isPublished: true });
        const totalExperts = await User.countDocuments({ role: { $in: ['instructor', 'admin', 'super_admin'] } });

        // Calculate Success Rate (percentage of courses completed)
        let successRate = 98;
        try {
            const CourseProgress = require('../models/CourseProgress');
            const totalEnrollments = await CourseProgress.countDocuments();
            const completedEnrollments = await CourseProgress.countDocuments({ progressPercentage: 100 });

            if (totalEnrollments > 0) {
                successRate = Math.round((completedEnrollments / totalEnrollments) * 100);
            }
        } catch (e) {
            // Ignore if model missing or error
        }

        // Get total course views
        const courses = await Course.find({ isPublished: true }).select('views');
        const totalViews = courses.reduce((acc, course) => acc + (course.views || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                learners: totalLearners,
                courses: totalCourses,
                experts: totalExperts,
                successRate: successRate,
                totalViews: totalViews
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getPublicStats = getPublicStats;
exports.getPlatformStats = getPublicStats; // Alias
