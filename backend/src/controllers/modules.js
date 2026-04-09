const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Get modules for a course
// @route   GET /api/v1/courses/:courseId/modules
// @access  Public
exports.getModules = async (req, res, next) => {
    try {
        if (req.params.courseId) {
            const modules = await Module.find({ course: req.params.courseId }).sort('order');
            return res.status(200).json({
                success: true,
                count: modules.length,
                data: modules
            });
        } else {
            return res.status(400).json({ success: false, error: 'Please provide detailed course ID' });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new module
// @route   POST /api/v1/courses/:courseId/modules
// @access  Private
exports.createModule = async (req, res, next) => {
    try {
        req.body.course = req.params.courseId;

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        // Check ownership
        if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        const module = await Module.create(req.body);

        // Add module to course
        course.modules.push(module._id);
        await course.save();

        res.status(201).json({
            success: true,
            data: module
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update module
// @route   PUT /api/v1/modules/:id
// @access  Private
exports.updateModule = async (req, res, next) => {
    try {
        let module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, error: 'Module not found' });
        }

        // Verify course ownership needed (simplified here)
        // In production, fetch course to check instructor

        module = await Module.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: module
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete module
// @route   DELETE /api/v1/modules/:id
// @access  Private
exports.deleteModule = async (req, res, next) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, error: 'Module not found' });
        }

        // 1. Delete associated lessons
        const Lesson = require('../models/Lesson');
        await Lesson.deleteMany({ module: module._id });

        // 2. Remove module from Course
        await Course.findByIdAndUpdate(module.course, {
            $pull: { modules: module._id }
        });

        await module.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
