const ErrorResponse = require('../utils/errorResponse'); // Assuming this exists or we use standard error handling
const User = require('../models/User');
const InstructorProfile = require('../models/InstructorProfile');
const Earning = require('../models/Earning');
const Course = require('../models/Course');

// @desc    Apply to become an instructor
// @route   POST /api/v1/instructors/apply
// @access  Private
exports.applyInstructor = async (req, res, next) => {
    try {
        const { bio, expertise, socialLinks, paymentDetails } = req.body;

        // Check if user already applied
        let profile = await InstructorProfile.findOne({ user: req.user.id });

        if (profile) {
            if (profile.status === 'pending') {
                return res.status(400).json({ success: false, error: 'Application already pending' });
            }
            if (profile.status === 'approved') {
                return res.status(400).json({ success: false, error: 'You are already an instructor' });
            }
        }

        const profileFields = {
            user: req.user.id,
            bio,
            expertise,
            socialLinks,
            paymentDetails,
            status: 'pending'
        };

        if (profile) {
            // Update existing (e.g. if rejected previously)
            profile = await InstructorProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
        } else {
            // Create new
            profile = await InstructorProfile.create(profileFields);
        }

        res.status(200).json({
            success: true,
            message: 'Instructor application submitted successfully',
            data: profile
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get current instructor profile
// @route   GET /api/v1/instructors/me
// @access  Private (Instructor)
exports.getInstructorProfile = async (req, res, next) => {
    try {
        const profile = await InstructorProfile.findOne({ user: req.user.id });

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Instructor profile not found' });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get instructor dashboard stats (Earnings, students, etc.)
// @route   GET /api/v1/instructors/dashboard
// @access  Private (Instructor)
exports.getDashboardStats = async (req, res, next) => {
    try {
        const profile = await InstructorProfile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Instructor profile not found' });
        }

        // Get recent earnings
        const recentEarnings = await Earning.find({ instructor: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get my courses stats
        const courses = await Course.find({ instructor: req.user.id });

        // Calculate total enrollments dynamically for accuracy
        const totalEnrollments = courses.reduce((acc, course) => acc + (course.totalEnrollments || 0), 0);
        const totalViews = courses.reduce((acc, course) => acc + (course.totalViews || 0), 0); // Assuming view count exists or will exist

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    status: profile.status,
                    balance: profile.currentBalance,
                    lifetimeEarnings: profile.lifetimeEarnings
                },
                metrics: {
                    totalStudents: totalEnrollments,
                    totalCourses: courses.length,
                    averageRating: profile.metrics.averageRating
                },
                recentEarnings,
                coursesSummary: courses.map(c => ({
                    id: c._id,
                    title: c.title,
                    enrollments: c.totalEnrollments,
                    rating: c.averageRating,
                    status: c.isPublished ? 'Published' : 'Draft'
                }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Approve/Reject Instructor (Admin)
// @route   PUT /api/v1/instructors/:id/status
// @access  Private (Admin)
exports.updateInstructorStatus = async (req, res, next) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected', 'suspended'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const profile = await InstructorProfile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({ success: false, error: 'Instructor profile not found' });
        }

        profile.status = status;
        await profile.save();

        // If approved, update user role to 'instructor'
        if (status === 'approved') {
            await User.findByIdAndUpdate(profile.user, { role: 'instructor' });
        } else if (status === 'suspended' || status === 'rejected') {
            // Revert to user if suspended/rejected? Or keep as instructor but blocked?
            // Usually revert to 'user' if rejected application.
            if (status === 'rejected') {
                await User.findByIdAndUpdate(profile.user, { role: 'user' });
            }
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all instructors (Admin)
// @route   GET /api/v1/instructors
// @access  Private (Admin)
exports.getInstructors = async (req, res, next) => {
    try {
        const instructors = await InstructorProfile.find()
            .populate('user', 'firstName lastName email avatar status');

        res.status(200).json({
            success: true,
            count: instructors.length,
            data: instructors
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all instructor applications (Admin)
// @route   GET /api/v1/instructors/applications
// @access  Private (Admin)
exports.getInstructorApplications = async (req, res, next) => {
    try {
        // Filter by status if provided in query, else get all pending
        const status = req.query.status || 'pending';

        const profiles = await InstructorProfile.find({ status })
            .populate('user', 'firstName lastName email avatar');

        res.status(200).json({
            success: true,
            count: profiles.length,
            data: profiles
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
