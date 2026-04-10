const { asyncHandler, AppError } = require('../utils/errorHandler');
const paymentService = require('../utils/paymentService');
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');
const Earning = require('../models/Earning');
const InstructorProfile = require('../models/InstructorProfile');
const logger = require('../utils/logger');

// @desc    Process Payment (Create Intent/Order)
// @route   POST /api/v1/payment/process
// @access  Private
exports.processPayment = asyncHandler(async (req, res, next) => {
    const { courseIds, method = 'stripe' } = req.body; // method can be 'stripe' or 'razorpay'

    if (!courseIds || courseIds.length === 0) {
        throw new AppError('No courses selected for payment', 400);
    }

    const courses = await Course.find({ _id: { $in: courseIds } });

    if (courses.length !== courseIds.length) {
        throw new AppError('One or more courses not found', 404);
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const course of courses) {
        totalPrice += course.price;
        orderItems.push({
            course: course._id,
            title: course.title,
            price: course.price,
            instructor: course.instructor
        });
    }

    const amount = Math.round(totalPrice * 100);

    if (amount === 0) {
        throw new AppError('Free courses should typically bypass payment intent', 400);
    }

    let paymentData = {};

    if (method === 'razorpay') {
        const razorpayOrder = await paymentService.createRazorpayOrder(
            amount,
            'INR',
            `order_rcpt_${Date.now()}`,
            { userId: req.user.id, courseIds: courseIds.join(',') }
        );

        paymentData = {
            id: razorpayOrder.id,
            status: 'pending',
            method: 'razorpay',
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        };

        // Create Pending Order
        const order = await Order.create({
            user: req.user.id,
            totalPrice,
            orderItems,
            paymentInfo: paymentData
        });

        res.status(200).json({
            success: true,
            method: 'razorpay',
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
            dbOrderId: order._id
        });

    } else {
        const paymentIntent = await paymentService.createPaymentIntent(
            amount,
            'inr',
            req.user.email,
            { userId: req.user.id }
        );

        paymentData = {
            id: paymentIntent.id,
            status: 'pending',
            method: 'stripe'
        };

        // Create Pending Order
        const order = await Order.create({
            user: req.user.id,
            totalPrice,
            orderItems,
            paymentInfo: paymentData
        });

        res.status(200).json({
            success: true,
            method: 'stripe',
            client_secret: paymentIntent.client_secret,
            orderId: order._id
        });
    }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/v1/payment/verify-razorpay
// @access  Private
exports.verifyRazorpayPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isVerified = paymentService.verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isVerified) {
        throw new AppError('Invalid payment signature', 400);
    }

    // Fulfill Order
    await fulfillOrder({ id: razorpay_order_id, status: 'succeeded' });

    res.status(200).json({
        success: true,
        message: 'Payment verified and order fulfilled'
    });
});

// @desc    Stripe Webhook
// @route   POST /api/v1/payment/webhook
// @access  Public
exports.stripeWebhook = asyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        // Route uses express.raw, so req.body is a Buffer
        event = paymentService.constructEvent(req.body, sig);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await fulfillOrder({ id: paymentIntent.id, status: 'succeeded' });
    }

    res.json({ received: true });
});

/**
 * Fulfill Order Logic (Modified to handle both Stripe/Razorpay IDs)
 */
const fulfillOrder = async (paymentData) => {
    try {
        const order = await Order.findOne({ 'paymentInfo.id': paymentData.id });

        if (!order) {
            logger.error(`Order not found for Payment ID: ${paymentData.id}`);
            return;
        }

        if (order.paymentInfo.status === 'succeeded') {
            return;
        }

        order.orderStatus = 'Completed';
        order.paymentInfo.status = 'succeeded';
        order.paidAt = Date.now();
        await order.save();

        const user = await User.findById(order.user);

        for (const item of order.orderItems) {
            if (!user.enrolledCourses.includes(item.course)) {
                user.enrolledCourses.push(item.course);
            }

            await Course.findByIdAndUpdate(item.course, { $inc: { totalEnrollments: 1 } });

            if (item.instructor) {
                const instructorShare = item.price * 0.80;

                await Earning.create({
                    instructor: item.instructor,
                    amount: instructorShare,
                    type: 'sale',
                    source: {
                        courseId: item.course,
                        orderId: order._id
                    },
                    description: `Sale of course: ${item.title}`
                });

                await InstructorProfile.findOneAndUpdate(
                    { user: item.instructor },
                    {
                        $inc: {
                            currentBalance: instructorShare,
                            lifetimeEarnings: instructorShare,
                            'metrics.totalStudents': 1
                        }
                    }
                );
            }
        }
        await user.save();
        logger.info(`Order ${order._id} fulfilled successfully.`);

    } catch (error) {
        logger.error(`Fulfillment Error: ${error.message}`);
    }
};

exports.sendStripeApiKey = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        stripeApiKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});
