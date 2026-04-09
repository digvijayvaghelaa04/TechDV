const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const InstructorProfile = require('../models/InstructorProfile');
const Earning = require('../models/Earning');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create new payment (Manual UPI or DEMO MODE)
// @route   POST /api/v1/payment/create
// @access  Private
exports.createPayment = asyncHandler(async (req, res, next) => {
    const { courseId, amount, transactionId, screenshot, upiId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${courseId}`, 404));
    }

    // Prevent duplicate purchases
    const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (existingEnrollment) {
        return next(new ErrorResponse('You are already enrolled in this course', 400));
    }

    // ============================================
    // DEMO PAYMENT MODE — bypasses real gateway
    // ============================================
    if (process.env.PAYMENT_MODE === 'demo') {
        const demoTxnId = `DEMO-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

        // Create a mock-approved payment record
        const payment = await Payment.create({
            paymentId: `PAY-DEMO-${Date.now()}`,
            user: req.user.id,
            course: courseId,
            courseName: course.title,
            amount: course.price,
            transactionId: demoTxnId,
            upiId: 'DEMO@TECHDEV',
            paymentMethod: 'DEMO',
            paymentStatus: 'success',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        });

        // Instantly create enrollment
        await Enrollment.create({
            user: req.user.id,
            course: courseId,
            amount: course.price,
            paymentMethod: 'DEMO',
            transactionId: demoTxnId,
            status: 'active'
        });

        // Add course to user's enrolledCourses array for persistence
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { enrolledCourses: courseId }
        });

        // Increment enrollment count on the course
        course.totalEnrollments += 1;
        await course.save();

        // Create instructor earnings record
        if (course.instructor) {
            const earningsAmount = Math.round(course.price * 0.7);
            await Earning.create({
                instructor: course.instructor,
                amount: earningsAmount,
                type: 'sale',
                status: 'completed',
                source: { courseId: course._id, transactionId: demoTxnId },
                description: `[DEMO] Sale of course: ${course.title}`
            });
            await InstructorProfile.findOneAndUpdate(
                { user: course.instructor },
                { $inc: { 'metrics.totalStudents': 1, 'lifetimeEarnings': earningsAmount, 'currentBalance': earningsAmount } }
            );
        }

        console.log(`[DEMO PAYMENT] User ${req.user.email} enrolled in "${course.title}" via demo mode.`);

        return res.status(200).json({
            success: true,
            demo: true,
            message: 'Demo payment processed. Course access unlocked instantly.',
            data: payment
        });
    }

    // ==============================
    // REAL UPI PAYMENT (production)
    // ==============================
    if (!transactionId) {
        return next(new ErrorResponse('Transaction ID is required for real payments', 400));
    }

    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
        return next(new ErrorResponse('Transaction ID already exists', 400));
    }

    const payment = await Payment.create({
        paymentId: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: req.user.id,
        course: courseId,
        courseName: course.title,
        amount,
        transactionId,
        upiId: upiId || 'DV7353@OKSBI',
        screenshot,
        paymentMethod: 'UPI',
        paymentStatus: 'pending',
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    });

    res.status(201).json({
        success: true,
        data: payment
    });
});

// @desc    Get current user's payments
// @route   GET /api/v1/payment/my-payments
// @access  Private
exports.getMyPayments = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
    });
});

// @desc    Get all payments (Admin)
// @route   GET /api/v1/payment/admin/all
// @access  Private/Admin
exports.getAllPayments = asyncHandler(async (req, res, next) => {
    const payments = await Payment.find().populate('user', 'firstName lastName email').sort('-createdAt');

    res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
    });
});

// @desc    Approve payment (Admin)
// @route   PUT /api/v1/payment/admin/:id/approve
// @access  Private/Admin
exports.approvePayment = asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findById(req.params.id).session(session);

        if (!payment) {
            return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
        }

        if (payment.paymentStatus === 'success') {
            return next(new ErrorResponse('Payment is already approved', 400));
        }

        payment.paymentStatus = 'success';
        await payment.save({ session });

        // Create Enrollment
        await Enrollment.create([{
            user: payment.user,
            course: payment.course,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            status: 'active'
        }], { session });

        // Update Course enrollments count
        const course = await Course.findById(payment.course).session(session);
        if (course) {
            course.totalEnrollments += 1;
            await course.save({ session });

            // Calculate Instructor Earnings (e.g., 70%)
            const earningsAmount = Math.round(payment.amount * 0.7);

            // Add detailed earning record
            await Earning.create([{
                instructor: course.instructor,
                amount: earningsAmount,
                type: 'sale',
                status: 'completed',
                source: {
                    courseId: course._id,
                    transactionId: payment.transactionId
                },
                description: `Sale of course: ${course.title}`
            }], { session });

            // Update Instructor Profile
            await InstructorProfile.findOneAndUpdate(
                { user: course.instructor },
                {
                    $inc: {
                        'metrics.totalStudents': 1,
                        'lifetimeEarnings': earningsAmount,
                        'currentBalance': earningsAmount
                    }
                },
                { session }
            );
        }

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
});

// @desc    Reject payment (Admin)
// @route   PUT /api/v1/payment/admin/:id/reject
// @access  Private/Admin
exports.rejectPayment = asyncHandler(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new ErrorResponse(`Payment not found with id of ${req.params.id}`, 404));
    }

    if (payment.paymentStatus === 'success') {
        return next(new ErrorResponse('Cannot reject an already approved payment', 400));
    }

    payment.paymentStatus = 'rejected';
    await payment.save();

    res.status(200).json({
        success: true,
        data: payment
    });
});
