const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { sendTokenResponse } = require('../utils/tokens');
const emailService = require('../utils/emailService');
const courseService = require('../services/courseService');
const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Mask an email for display: "digvijay@gmail.com" → "di******@gmail.com"
 * Used only in responses — never for DB lookups.
 */
const maskEmail = (email) => {
    const [local, domain] = email.split('@');
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(local.length - 2, 4))}@${domain}`;
};

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER
// @desc    Register user and send email OTP
// @route   POST /api/v1/auth/register
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
exports.register = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, username, email, mobileNumber, password, confirmPassword, dateOfBirth, education } = req.body;

    // ── Confirm password match ───────────────────────────────────────────────
    if (password !== confirmPassword) {
        throw new AppError('Passwords do not match', 400);
    }

    // ── Duplicate detection ──────────────────────────────────────────────────
    const existingByEmail = await User.findOne({ email });

    if (existingByEmail) {
        if (existingByEmail.isVerified) {
            // Verified account → hard block. Don't leak "email already used" in
            // a super-specific way — but this is a registration form so it's fine.
            throw new AppError('An account with this email already exists. Please log in.', 409);
        } else {
            // Unverified stale account → delete and allow fresh registration.
            // This handles the case where someone registered, never verified,
            // and tries to register again with the same email.
            await existingByEmail.deleteOne();
        }
    }

    // Username / mobileNumber uniqueness
    const existingOther = await User.findOne({ $or: [{ username }, { mobileNumber }] });
    if (existingOther) {
        if (existingOther.username === username) throw new AppError('Username already taken', 400);
        if (existingOther.mobileNumber === mobileNumber) throw new AppError('Mobile number already registered', 400);
    }

    // ── Create user with status: pending ────────────────────────────────────
    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        mobileNumber,
        password,
        dateOfBirth,
        education,
        isVerified: false,
        status: 'pending'
    });

    // ── Generate hashed OTP ──────────────────────────────────────────────────
    // generateEmailOTP() sets otp.hash, otp.expire, resets otp.attempts
    // and returns the PLAIN OTP for sending in email.
    const plainOTP = await user.generateEmailOTP();
    await user.save({ validateBeforeSave: false });

    // ── DEV MODE: Log OTP to console instead of sending email ───────────────
    if (process.env.DEV_AUTO_VERIFY_OTP === 'true') {
        console.log(`\n🔑 [DEV OTP] Email: ${email} | OTP: ${plainOTP}\n`);
    }

    // ── Send OTP email (non-blocking fallback on failure) ────────────────────
    try {
        await emailService.sendEmailOTPVerification(email, firstName, plainOTP);
    } catch (emailErr) {
        // In dev, email failure is non-fatal — OTP is logged above.
        // In production, we still complete registration but warn.
        console.warn(`[EMAIL] Failed to send OTP email to ${email}: ${emailErr.message}`);
        if (process.env.NODE_ENV === 'production' && process.env.DEV_AUTO_VERIFY_OTP !== 'true') {
            // Clean up user if email is critical and failed in production
            await user.deleteOne();
            throw new AppError('Failed to send verification email. Please try again later.', 500);
        }
    }

    const response = {
        success: true,
        message: 'OTP sent to your email. Please verify your account.',
        userId: user._id,
        maskedEmail: maskEmail(email)
    };

    // Dev mode: expose OTP in response body (never in production)
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTO_VERIFY_OTP === 'true') {
        response.devOtp = plainOTP;
    }

    res.status(201).json(response);
});

// ══════════════════════════════════════════════════════════════════════════════
// VERIFY OTP
// @desc    Verify email OTP and activate account
// @route   POST /api/v1/auth/verify-otp
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
exports.verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    // Select otp fields explicitly (they are select:false on schema)
    const user = await User.findOne({ email }).select('+otp.hash +otp.expire +otp.attempts');

    if (!user) {
        // Generic response — don't reveal whether email exists
        throw new AppError('Invalid or expired OTP', 400);
    }

    // Already verified?
    if (user.isVerified) {
        throw new AppError('This account is already verified. Please log in.', 409);
    }

    // No OTP on record?
    if (!user.otp.hash || !user.otp.expire) {
        throw new AppError('No verification code found. Please request a new OTP.', 400);
    }

    // Too many wrong attempts?
    const MAX_ATTEMPTS = 5;
    if (user.otp.attempts >= MAX_ATTEMPTS) {
        throw new AppError('Too many incorrect attempts. Please request a new OTP.', 429);
    }

    // OTP expired?
    if (user.otp.expire < Date.now()) {
        throw new AppError('OTP has expired. Please request a new one.', 400);
    }

    // Hash comparison
    const isMatch = await user.verifyOTPHash(otp);

    if (!isMatch) {
        user.otp.attempts += 1;
        await user.save({ validateBeforeSave: false });

        const remaining = MAX_ATTEMPTS - user.otp.attempts;
        if (remaining <= 0) {
            throw new AppError('Too many incorrect attempts. Please request a new OTP.', 429);
        }
        throw new AppError(`Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, 400);
    }

    // ── OTP is correct — activate account ───────────────────────────────────
    user.isVerified = true;
    user.status = 'active';
    user.emailVerifiedAt = new Date();

    // Clear all OTP fields
    user.otp.hash = undefined;
    user.otp.expire = undefined;
    user.otp.attempts = 0;
    user.otp.resendCount = 0;
    user.otp.lastResendAt = undefined;

    await user.save({ validateBeforeSave: false });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.firstName)
        .catch(err => console.warn('[EMAIL] Welcome email skipped:', err.message));

    res.status(200).json({
        success: true,
        message: 'Email verified successfully. Your account is now active. Please log in.'
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// RESEND OTP
// @desc    Resend email verification OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
exports.resendOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+otp.hash +otp.expire +otp.resendCount +otp.lastResendAt');

    if (!user) {
        // Generic response — don't reveal whether email exists
        return res.status(200).json({
            success: true,
            message: 'If this email is registered and unverified, a new OTP has been sent.'
        });
    }

    if (user.isVerified) {
        throw new AppError('This account is already verified. Please log in.', 409);
    }

    // ── Rate limit: max 3 resends per hour ──────────────────────────────────
    const MAX_RESENDS = 3;
    const RESEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour

    const windowStart = Date.now() - RESEND_WINDOW_MS;
    const lastResend = user.otp.lastResendAt ? user.otp.lastResendAt.getTime() : 0;

    // Reset counter if outside the window
    if (lastResend < windowStart) {
        user.otp.resendCount = 0;
    }

    if (user.otp.resendCount >= MAX_RESENDS) {
        throw new AppError('Maximum OTP resend limit reached. Please wait 1 hour before trying again.', 429);
    }

    // ── Generate new OTP (invalidates previous) ──────────────────────────────
    const plainOTP = await user.generateEmailOTP(); // resets hash, expire, attempts
    user.otp.resendCount += 1;
    user.otp.lastResendAt = new Date();

    await user.save({ validateBeforeSave: false });

    if (process.env.DEV_AUTO_VERIFY_OTP === 'true') {
        console.log(`\n🔑 [DEV RESEND OTP] Email: ${email} | OTP: ${plainOTP}\n`);
    }

    try {
        await emailService.sendEmailOTPVerification(email, user.firstName, plainOTP);
    } catch (emailErr) {
        console.warn(`[EMAIL] Resend OTP email failed for ${email}: ${emailErr.message}`);
        if (process.env.NODE_ENV === 'production') {
            throw new AppError('Failed to send OTP email. Please try again shortly.', 500);
        }
    }

    const response = {
        success: true,
        message: 'A new OTP has been sent to your email.',
        maskedEmail: maskEmail(email)
    };

    if (process.env.NODE_ENV !== 'production' && process.env.DEV_AUTO_VERIFY_OTP === 'true') {
        response.devOtp = plainOTP;
    }

    res.status(200).json(response);
});

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// @desc    Authenticate user and issue tokens
// @route   POST /api/v1/auth/login
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +failedLoginAttempts +lockUntil');

    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    // Account lockout check
    if (user.lockUntil && user.lockUntil > Date.now()) {
        throw new AppError('Account is temporarily locked due to multiple failed login attempts. Please try again later.', 429);
    }

    // Password check
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minute lock
            user.failedLoginAttempts = 0;
            await user.save({ validateBeforeSave: false });
            throw new AppError('Account locked for 15 minutes due to multiple failed attempts.', 429);
        }

        await user.save({ validateBeforeSave: false });
        throw new AppError('Invalid credentials', 401);
    }

    // ── Check email verification ─────────────────────────────────────────────
    // Only fully verified users may receive a JWT.
    if (!user.isVerified) {
        return res.status(403).json({
            success: false,
            error: 'Your email is not verified. Please check your inbox and verify your OTP first.',
            requireVerification: true,
            maskedEmail: maskEmail(user.email),
            // Include email so frontend can pre-fill the resend form / navigate to /verify-otp
            email: user.email
        });
    }

    // Check suspended/blocked status
    if (user.status === 'suspended') {
        throw new AppError('Your account has been suspended. Please contact support.', 403);
    }
    if (user.status === 'blocked') {
        throw new AppError('Your account has been blocked. Please contact support.', 403);
    }

    // ── Login successful ─────────────────────────────────────────────────────
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    await sendTokenResponse(user, 200, res, req);
});

// ══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// @desc    Logout user / revoke refresh token
// @route   GET /api/v1/auth/logout
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
exports.logout = asyncHandler(async (req, res, next) => {
    const token = req.cookies.refreshToken;

    if (token) {
        await RefreshToken.findOneAndUpdate(
            { token },
            { revoked: Date.now(), revokedByIp: req.ip }
        );
    }

    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.status(200).json({ success: true, data: {} });
});

// ══════════════════════════════════════════════════════════════════════════════
// REFRESH TOKEN
// @desc    Issue new access token via refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (Cookie)
// ══════════════════════════════════════════════════════════════════════════════
exports.refreshToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        throw new AppError('Token not found, authorization denied', 401);
    }

    const refreshToken = await RefreshToken.findOne({ token }).populate('user');

    if (!refreshToken || !refreshToken.isActive) {
        throw new AppError('Invalid or expired refresh token', 401);
    }

    const { user } = refreshToken;

    if (!user) {
        throw new AppError('User associated with this token no longer exists', 401);
    }

    const newToken = await sendTokenResponse(user, 200, res, req);

    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = req.ip;
    refreshToken.replacedByToken = newToken.token;
    await refreshToken.save();
});

// ══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// @desc    Send password reset OTP
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        throw new AppError('There is no user with that email', 404);
    }

    const resetOtp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    try {
        await emailService.sendPasswordResetEmail(user.email, resetOtp);
        res.status(200).json({ success: true, message: 'Password reset OTP sent to email' });
    } catch (err) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError('Email could not be sent', 500);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// RESET PASSWORD
// @desc    Reset password using OTP
// @route   PUT /api/v1/auth/resetpassword
// @access  Public
// ══════════════════════════════════════════════════════════════════════════════
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
        throw new AppError('Invalid or expired OTP', 400);
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    // Invalidate all refresh tokens on password change
    await RefreshToken.updateMany({ user: user._id }, { revoked: Date.now(), revokedByIp: req.ip });

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
});

// ══════════════════════════════════════════════════════════════════════════════
// GET ME
// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
});

// ══════════════════════════════════════════════════════════════════════════════
// UPDATE DETAILS
// @desc    Update user profile
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
exports.updateDetails = asyncHandler(async (req, res, next) => {
    if (req.body.email || req.body.username || req.body.mobileNumber) {
        const query = [];
        if (req.body.email && req.body.email !== req.user.email) query.push({ email: req.body.email });
        if (req.body.username && req.body.username !== req.user.username) query.push({ username: req.body.username });
        if (req.body.mobileNumber && req.body.mobileNumber !== req.user.mobileNumber) query.push({ mobileNumber: req.body.mobileNumber });

        if (query.length > 0) {
            const conflict = await User.findOne({ $or: query });
            if (conflict) {
                if (req.body.email === conflict.email) throw new AppError('Email already taken', 400);
                if (req.body.username === conflict.username) throw new AppError('Username already taken', 400);
                if (req.body.mobileNumber === conflict.mobileNumber) throw new AppError('Mobile number already taken', 400);
            }
        }
    }

    const allowedFields = ['firstName', 'lastName', 'email', 'mobileNumber', 'username', 'dateOfBirth', 'education', 'avatar'];
    const fieldsToUpdate = {};
    allowedFields.forEach(field => {
        if (req.body[field] !== undefined) fieldsToUpdate[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: user });
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE ACCOUNT
// @route   DELETE /api/v1/auth/deleteaccount
// @access  Private
// ══════════════════════════════════════════════════════════════════════════════
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, data: {} });
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new AppError(`User not found with id of ${req.params.id}`, 404);
    }

    const Enrollment = require('../models/Enrollment');
    const CourseProgress = require('../models/CourseProgress');
    const Review = require('../models/Review');

    await Enrollment.deleteMany({ user: user._id });
    await CourseProgress.deleteMany({ user: user._id });
    await RefreshToken.deleteMany({ user: user._id });
    if (Review) await Review.deleteMany({ user: user._id });

    if (user.role === 'instructor') {
        const InstructorProfile = require('../models/InstructorProfile');
        const Course = require('../models/Course');
        await InstructorProfile.findOneAndDelete({ user: user._id });
        const instructorCourses = await Course.find({ instructor: user._id });
        for (const course of instructorCourses) {
            await courseService.deleteCourseDeeply(course._id);
        }
    }

    await user.deleteOne();
    res.status(200).json({ success: true, data: {} });
});

exports.createUser = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, username, email, mobileNumber, password, role } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }, { mobileNumber }] });
    if (userExists) {
        if (userExists.email === email) throw new AppError('Email already registered', 400);
        if (userExists.username === username) throw new AppError('Username already taken', 400);
        if (userExists.mobileNumber === mobileNumber) throw new AppError('Mobile number already registered', 400);
    }

    const user = await User.create({
        firstName, lastName, username, email, mobileNumber, password,
        role: role || 'user',
        isVerified: true, // Admin-created users are pre-verified
        status: 'active'
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: user });
});

exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, data: users });
});

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found', 404);
    res.status(200).json({ success: true, data: user });
});

exports.updateUserRole = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
});

exports.updateUserPermissions = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { permissions: req.body.permissions }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
});

exports.updateUserStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
});
