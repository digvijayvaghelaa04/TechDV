const Lesson = require('../models/Lesson');
const Module = require('../models/Module');

// @desc    Get lessons for a module
// @route   GET /api/v1/modules/:moduleId/lessons
// @access  Public
exports.getLessons = async (req, res, next) => {
    try {
        const lessons = await Lesson.find({ module: req.params.moduleId }).sort('order');

        res.status(200).json({
            success: true,
            count: lessons.length,
            data: lessons
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new lesson
// @route   POST /api/v1/modules/:moduleId/lessons
// @access  Private
exports.createLesson = async (req, res, next) => {
    try {
        req.body.module = req.params.moduleId;

        const module = await Module.findById(req.params.moduleId);

        if (!module) {
            return res.status(404).json({ success: false, error: 'Module not found' });
        }

        req.body.course = module.course; // Inherit course ID from module

        const lesson = await Lesson.create(req.body);

        module.lessons.push(lesson._id);
        await module.save();

        res.status(201).json({
            success: true,
            data: lesson
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update lesson
// @route   PUT /api/v1/lessons/:id
// @access  Private
exports.updateLesson = async (req, res, next) => {
    try {
        let lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ success: false, error: 'Lesson not found' });
        }

        lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: lesson
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete lesson
// @route   DELETE /api/v1/lessons/:id
// @access  Private
exports.deleteLesson = async (req, res, next) => {
    try {
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ success: false, error: 'Lesson not found' });
        }

        // 1. Remove lesson from Module
        await Module.findByIdAndUpdate(lesson.module, {
            $pull: { lessons: lesson._id }
        });

        await lesson.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
