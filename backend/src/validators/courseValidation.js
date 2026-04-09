const Joi = require('joi');

/**
 * Validation Schemas for Course Routes
 */

// Create Course Schema
exports.createCourseSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Course title is required',
            'string.min': 'Title must be at least 5 characters',
            'string.max': 'Title cannot exceed 200 characters'
        }),

    description: Joi.string()
        .trim()
        .min(50)
        .max(5000)
        .required()
        .messages({
            'string.empty': 'Course description is required',
            'string.min': 'Description must be at least 50 characters',
            'string.max': 'Description cannot exceed 5000 characters'
        }),

    category: Joi.string()
        .trim()
        .valid('Development', 'Design', 'Business', 'Marketing', 'SaaS', 'AI', 'Data Science', 'Other')
        .required()
        .messages({
            'any.only': 'Please select a valid category'
        }),

    level: Joi.string()
        .valid('Beginner', 'Intermediate', 'Advanced', 'All Levels')
        .required()
        .messages({
            'any.only': 'Please select a valid difficulty level'
        }),

    price: Joi.number()
        .min(0)
        .max(999999)
        .precision(2)
        .required()
        .messages({
            'number.min': 'Price must be 0 or greater',
            'number.max': 'Price cannot exceed 999,999'
        }),

    thumbnail: Joi.string()
        .uri(),

    previewVideo: Joi.string()
        .uri(),

    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .max(10),

    prerequisites: Joi.array()
        .items(Joi.string().trim().max(200))
        .max(10),

    learningOutcomes: Joi.array()
        .items(Joi.string().trim().max(200))
        .max(20),

    language: Joi.string()
        .trim()
        .max(50)
        .default('English'),

    isPublished: Joi.boolean()
        .default(false)
});

// Update Course Schema (all fields optional)
exports.updateCourseSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(200),

    description: Joi.string()
        .trim()
        .min(50)
        .max(5000),

    category: Joi.string()
        .trim()
        .valid('Development', 'Design', 'Business', 'Marketing', 'SaaS', 'AI', 'Data Science', 'Other'),

    level: Joi.string()
        .valid('Beginner', 'Intermediate', 'Advanced', 'All Levels'),

    price: Joi.number()
        .min(0)
        .max(999999)
        .precision(2),

    thumbnail: Joi.string()
        .uri(),

    previewVideo: Joi.string()
        .uri(),

    tags: Joi.array()
        .items(Joi.string().trim().max(50))
        .max(10),

    prerequisites: Joi.array()
        .items(Joi.string().trim().max(200))
        .max(10),

    learningOutcomes: Joi.array()
        .items(Joi.string().trim().max(200))
        .max(20),

    language: Joi.string()
        .trim()
        .max(50),

    isPublished: Joi.boolean()
});

// Course Query Schema
exports.courseQuerySchema = Joi.object({
    search: Joi.string()
        .trim()
        .max(100),

    category: Joi.string()
        .trim()
        .valid('All', 'Development', 'Design', 'Business', 'Marketing', 'SaaS', 'AI', 'Data Science', 'Other'),

    level: Joi.string()
        .valid('Beginner', 'Intermediate', 'Advanced', 'All Levels'),

    minPrice: Joi.number()
        .min(0),

    maxPrice: Joi.number()
        .min(0),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20),

    sort: Joi.string()
        .valid('createdAt', '-createdAt', 'price', '-price', 'title', '-title', 'averageRating', '-averageRating')
        .default('-createdAt')
});
