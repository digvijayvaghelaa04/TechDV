const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Schema
 *
 * OTP Strategy: OTP fields live inside the User document (not a separate collection).
 * Rationale: The user document is always available during auth flows, TTL indexes handle
 * automatic cleanup, and the added complexity of a join is not warranted for a single-purpose
 * OTP record. The hash-only approach (never storing plaintext) keeps this secure.
 */
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please add a first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name']
    },
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    mobileNumber: {
        type: String,
        required: [true, 'Please add a mobile number'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'instructor', 'admin', 'super_admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'blocked'],
        default: 'pending' // New users start as pending until email is verified
    },

    // ─── Email Verification ───────────────────────────────────────────────────
    // Top-level isVerified is the canonical "can this user log in?" gate.
    // It is set to true only after successful OTP verification.
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },

    // ─── OTP Fields ───────────────────────────────────────────────────────────
    // hash: bcrypt hash of the 6-digit OTP — NEVER store plaintext
    // expire: absolute expiry timestamp (10 minutes from generation)
    // attempts: counts wrong-OTP submissions; locked at 5 to prevent brute force
    // resendCount: counts resend requests within a 1-hour window
    // lastResendAt: timestamp of last resend, used to enforce the hourly window
    otp: {
        hash: { type: String, select: false },   // always select explicitly
        expire: { type: Date, select: false },
        attempts: { type: Number, default: 0 },
        resendCount: { type: Number, default: 0 },
        lastResendAt: { type: Date, default: null }
    },

    // ─── Granular Permissions (admin role only) ───────────────────────────────
    permissions: {
        canAddCourse: { type: Boolean, default: false },
        canUpdateCourse: { type: Boolean, default: false },
        canDeleteCourse: { type: Boolean, default: false },
        canViewUsers: { type: Boolean, default: true },
        canViewCourses: { type: Boolean, default: true }
    },

    avatar: {
        type: String,
        default: 'default-avatar.jpg'
    },
    dateOfBirth: Date,
    education: String,

    enrolledCourses: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    }],
    wishlist: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Course'
    }],

    // ─── Password Reset ───────────────────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    resetPasswordOtp: String,
    resetPasswordOtpExpire: Date,

    // ─── Security ─────────────────────────────────────────────────────────────
    lastLogin: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    sessionToken: String,
    lockUntil: Date,
    totalSpent: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// TTL index: Mongoose will auto-delete otp sub-document after expiry
// Note: MongoDB TTL works on top-level Date fields, so otp.expire auto-cleanup
// is handled by the controller clearing otp fields on verification.
userSchema.index({ 'otp.expire': 1 }, { expireAfterSeconds: 0 });
userSchema.index({ resetPasswordOtpExpire: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });
userSchema.index({ isVerified: 1 });

// ─── Password Hashing ─────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

// Sign JWT access token
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
};

// Match entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate and store a hashed OTP.
 * Returns the PLAIN OTP for email delivery — never store the plain version.
 * @returns {string} 6-digit plain OTP
 */
userSchema.methods.generateEmailOTP = async function () {
    const crypto = require('crypto');
    const plain = crypto.randomInt(100000, 999999).toString();
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    this.otp.hash = await bcrypt.hash(plain, rounds);
    this.otp.expire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    this.otp.attempts = 0;
    return plain;
};

/**
 * Verify a OTP submission against the stored hash.
 * @param {string} plain - The OTP entered by the user
 * @returns {boolean}
 */
userSchema.methods.verifyOTPHash = async function (plain) {
    if (!this.otp.hash) return false;
    return await bcrypt.compare(plain, this.otp.hash);
};

module.exports = mongoose.model('User', userSchema);
