const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

// Generate Access Token (Short-lived: 15 mins)
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            permissions: user.permissions,
            sessionToken: user.sessionToken
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// Generate Refresh Token (Long-lived: 7 days) and save to DB
const generateRefreshToken = async (user, ipAddress) => {
    // Determine user ID
    const userId = user._id;

    // Create a random token string
    const token = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save to database
    const refreshToken = await RefreshToken.create({
        user: userId,
        token,
        expires,
        createdByIp: ipAddress
    });

    return refreshToken;
};

// Send Tokens in Response
const sendTokenResponse = async (user, statusCode, res, req) => {
    // Single Device Login: Invalidate all previous sessions
    user.sessionToken = crypto.randomBytes(20).toString('hex');
    await user.save({ validateBeforeSave: false });
    await RefreshToken.deleteMany({ user: user._id });

    // generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user, req.ip);

    // cookie options
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        secure: false, // Force false for localhost debugging
        sameSite: 'Lax', // Required for cross-port cookie sending in some browsers, Strict might block if link from external site
        path: '/' // Ensure cookie is available on all routes
    };

    // Save refresh token in cookie
    res.cookie('refreshToken', refreshToken.token, cookieOptions);

    // Return access token + user data
    res.status(statusCode).json({
        success: true,
        accessToken,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            mobileNumber: user.mobileNumber,
            role: user.role,
            permissions: user.permissions,
            dateOfBirth: user.dateOfBirth,
            education: user.education,
            avatar: user.avatar
        }
    });

    return refreshToken;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    sendTokenResponse
};
