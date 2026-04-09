const mongoose = require('mongoose');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');

const User = require('../models/User');

// @desc    Create order (Purchase)
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderItems, totalPrice, paymentInfo } = req.body;

        const order = await Order.create([{
            user: req.user.id,
            orderItems,
            totalPrice,
            itemsPrice: totalPrice, // Assuming for now
            paymentInfo: paymentInfo || { id: 'sys_' + Date.now(), status: 'Paid', type: 'system' },
            orderStatus: 'Paid',
            paidAt: Date.now()
        }], { session });

        // Create enrollment for each item
        for (const item of orderItems) {
            // Check if already enrolled
            const existingEnrollment = await Enrollment.findOne({ user: req.user.id, course: item.course }).session(session);
            if (!existingEnrollment) {
                await Enrollment.create([{
                    user: req.user.id,
                    course: item.course,
                    order: order[0]._id,
                    status: 'enrolled'
                }], { session });
            }
        }

        // Update User's total spent
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { totalSpent: totalPrice }
        }, { session });

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            data: order[0]
        });
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ success: false, error: err.message });
    } finally {
        session.endSession();
    }
};

// @desc    Get my orders
// @route   GET /api/v1/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('orderItems.course', 'title thumbnail price')
            .lean();

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get all orders (Super Admin)
// @route   GET /api/v1/orders
// @access  Private (Super Admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            .populate('orderItems.course', 'title price')
            .lean();

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
