const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    refreshToken,
    getAllUsers,
    getUser,
    verifyOTP,
    resendOTP,
    updateDetails,
    deleteAccount,
    updateUserRole,
    updateUserPermissions,
    updateUserStatus,
    forgotPassword,
    resetPassword,
    deleteUser,
    createUser
} = require('../controllers/auth');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');
const {
    registerSchema,
    loginSchema,
    verifyOtpSchema,
    resendOtpSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    adminCreateUserSchema
} = require('../validators/authValidation');

const { authLimiter, otpLimiter, registerLimiter } = require('../middleware/security');

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register',     registerLimiter,  validateRequest(registerSchema),     register);
router.post('/verify-otp',   otpLimiter,       validateRequest(verifyOtpSchema),    verifyOTP);
router.post('/resend-otp',   otpLimiter,       validateRequest(resendOtpSchema),    resendOTP);
router.post('/login',        authLimiter,      validateRequest(loginSchema),        login);
router.post('/refresh-token',                  refreshToken);
router.post('/forgotpassword', otpLimiter,     validateRequest(forgotPasswordSchema), forgotPassword);
router.put('/resetpassword',                   validateRequest(resetPasswordSchema), resetPassword);

// ─── Protected Routes ──────────────────────────────────────────────────────────
router.get('/logout',        logout);
router.get('/me',            protect, getMe);
router.put('/updatedetails', protect, validateRequest(updateProfileSchema), updateDetails);
router.delete('/deleteaccount', protect, deleteAccount);

// ─── Admin / Super Admin ───────────────────────────────────────────────────────
router.get('/users',         protect, authorize('admin', 'super_admin'), getAllUsers);
router.get('/users/:id',     protect, authorize('admin', 'super_admin'), getUser);

// ─── Super Admin Only ──────────────────────────────────────────────────────────
router.post('/users',          protect, authorize('super_admin'), validateRequest(adminCreateUserSchema), createUser);
router.put('/users/:id/role',  protect, authorize('super_admin'), updateUserRole);
router.put('/users/:id/permissions', protect, authorize('super_admin'), updateUserPermissions);
router.put('/users/:id/status', protect, authorize('super_admin'), updateUserStatus);
router.delete('/users/:id',    protect, authorize('super_admin'), deleteUser);

module.exports = router;
