const mongoose = require('mongoose');
const Course = require('../models/Course');
const courseService = require('../services/courseService');
const courseBuilderService = require('../services/courseBuilderService');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Base filter
        let filter = JSON.parse(queryStr);

        // Add search functionality
        if (req.query.search) {
            filter.title = { $regex: req.query.search, $options: 'i' };
        }

        // Add category functionality
        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }

        // Finding resource
        query = Course.find(filter).populate('instructor', 'firstName lastName avatar');

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Course.countDocuments(filter);

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const courses = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: courses.length,
            pagination,
            data: courses
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('instructor', 'firstName lastName avatar education')
            .populate({
                path: 'modules',
                populate: {
                    path: 'lessons'
                }
            });

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new course
// @route   POST /api/v1/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.instructor = req.user.id;

        const modulesPayload = req.body.modules;
        delete req.body.modules; // Prevent Mongoose casting error mapping objects to ObjectIds

        const course = await Course.create(req.body);

        // Run deep sync engine if curriculum array provided
        if (modulesPayload && Array.isArray(modulesPayload)) {
            await courseBuilderService.syncCourseCurriculum(course._id, modulesPayload);
        }

        // Return the fully built structure
        const finalCourse = await Course.findById(course._id).populate({
            path: 'modules',
            populate: { path: 'lessons' }
        });

        res.status(201).json({
            success: true,
            data: finalCourse
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private (Owner/Admin)
exports.updateCourse = async (req, res, next) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Make sure user is course owner or admin
        const isOwner = course.instructor.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

        if (!isOwner && !isAdmin) {
            return res.status(401).json({ success: false, error: 'Not authorized to update this course' });
        }

        const modulesPayload = req.body.modules;
        delete req.body.modules;

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (modulesPayload && Array.isArray(modulesPayload)) {
            await courseBuilderService.syncCourseCurriculum(course._id, modulesPayload);
        }

        const finalCourse = await Course.findById(course._id).populate({
            path: 'modules',
            populate: { path: 'lessons' }
        });

        res.status(200).json({
            success: true,
            data: finalCourse
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private (Owner/Admin)
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Make sure user is course owner or admin
        const isOwner = course.instructor.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

        if (!isOwner && !isAdmin) {
            return res.status(401).json({ success: false, error: 'Not authorized to delete this course' });
        }

        // Delegate complex ACID deep-deletion to CourseService
        await courseService.deleteCourseDeeply(course._id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
