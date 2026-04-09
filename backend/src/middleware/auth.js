const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        // Set token from query parameter (vital for <video src> media tags)
        token = req.query.token;
    } else if (req.cookies.token) {
        // Set token from cookie (if used)
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({ success: false, error: 'User no longer exists' });
        }

        // Single Device Login Check
        if (decoded.sessionToken && decoded.sessionToken !== req.user.sessionToken) {
            return res.status(401).json({ success: false, error: 'Your account was logged in from another device.', code: 'SESSION_INVALIDATED' });
        }

        // Check Account Status
        if (req.user.status !== 'active') {
            return res.status(403).json({ success: false, error: `Your account is ${req.user.status}` });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// New: Check for specific granular permission
// Usage: hasPermission('canManageCourses')
exports.hasPermission = (permissionKey) => {
    return (req, res, next) => {
        // Super Admin Bypass - God Mode
        if (req.user.role === 'super_admin') {
            return next();
        }

        // Logic for Admin
        if (req.user.role === 'admin') {
            if (req.user.permissions && req.user.permissions[permissionKey] === true) {
                return next();
            }
            return res.status(403).json({
                success: false,
                error: `Admin does not have permission: ${permissionKey}`
            });
        }

        // Logic for Instructor
        if (req.user.role === 'instructor') {
            const allowedInstructorPermissions = ['canAddCourse', 'canUpdateCourse', 'canDeleteCourse', 'canManageCurriculum'];
            if (allowedInstructorPermissions.includes(permissionKey)) {
                return next();
            }
            return res.status(403).json({
                success: false,
                error: `Instructor does not have permission: ${permissionKey}`
            });
        }

        // Users blocked by default for admin actions
        return res.status(403).json({
            success: false,
            error: 'Not authorized'
        });
    };
};
