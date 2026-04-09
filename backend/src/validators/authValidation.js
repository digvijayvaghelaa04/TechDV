const Joi = require('joi');

/**
 * Validation Schemas for Authentication Routes
 * Uses Joi for comprehensive input validation.
 *
 * Password rules enforced here:
 *  - Minimum 8 characters
 *  - At least one uppercase letter
 *  - At least one number
 *  - At least one special character
 */

const strongPassword = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/)
    .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one number, and one special character'
    });

// ─── Register ─────────────────────────────────────────────────────────────────
exports.registerSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    username: Joi.string().trim().min(3).max(30).lowercase().required(),
    email: Joi.string().trim().email().lowercase().required(),
    mobileNumber: Joi.string().trim().min(10).max(15).required(),
    password: strongPassword.required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        .messages({ 'any.only': 'Passwords do not match' }),
    dateOfBirth: Joi.date().max('now').allow(null, ''),
    education: Joi.string().trim().max(200).allow('')
});

// ─── Admin Create User ────────────────────────────────────────────────────────
exports.adminCreateUserSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    username: Joi.string().trim().min(3).max(30).lowercase().required(),
    email: Joi.string().trim().email().lowercase().required(),
    mobileNumber: Joi.string().trim().min(10).max(15).required(),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('user', 'instructor', 'admin', 'super_admin').required()
});

// ─── Login ────────────────────────────────────────────────────────────────────
exports.loginSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean()
});

// ─── Verify OTP ───────────────────────────────────────────────────────────────
// Uses email (not userId) as the primary identifier — safer and more intuitive
exports.verifyOtpSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required(),
    otp: Joi.string().length(6).pattern(/^\d{6}$/).required()
        .messages({ 'string.pattern.base': 'OTP must be a 6-digit number' })
});

// ─── Resend OTP ───────────────────────────────────────────────────────────────
exports.resendOtpSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required()
});

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfileSchema = Joi.object({
    firstName: Joi.string().trim().min(1).max(100).allow(''),
    lastName: Joi.string().trim().min(1).max(100).allow(''),
    username: Joi.string().trim().min(3).max(50).lowercase().allow(''),
    email: Joi.string().trim().email().lowercase().allow(''),
    mobileNumber: Joi.string().trim().min(10).max(20).allow(''),
    dateOfBirth: Joi.date().max('now').allow(null, ''),
    education: Joi.string().trim().max(500).allow(''),
    avatar: Joi.string().trim().allow('')
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required()
});

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPasswordSchema = Joi.object({
    email: Joi.string().trim().email().lowercase().required(),
    otp: Joi.string().length(6).required(),
    password: Joi.string().min(8).max(128).required()
});

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required().invalid(Joi.ref('currentPassword'))
});
