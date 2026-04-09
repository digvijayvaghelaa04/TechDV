const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

/**
 * Security Middleware Configuration
 */

// Rate limiting configurations
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Hardened for production
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes — brute-force protection
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many login attempts. Please wait 15 minutes and try again.'
    }
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 registration attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many registration attempts. Please try again later.'
    }
});

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limit OTP requests
    message: {
        success: false,
        error: 'Too many OTP requests, please try again later'
    }
});

const xss = require('xss');

// Deep clean object using 'xss' library
const cleanObject = (obj) => {
    if (!obj) return obj;
    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = xss(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            cleanObject(obj[key]);
        }
    }
    return obj;
};

// XSS Sanitizer Middleware using 'xss' library
const xssClean = (req, res, next) => {
    if (req.body) cleanObject(req.body);
    if (req.query) cleanObject(req.query);
    if (req.params) cleanObject(req.params);
    next();
};

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Block requests with no origin in production (dev tools allowed in development only)
        if (!origin) {
            if (process.env.NODE_ENV === 'development') return callback(null, true);
            return callback(new Error('No origin not allowed in production'));
        }

        const whitelist = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()) : ['http://localhost:5173'];

        // Add 127.0.0.1 variants just in case
        whitelist.push('http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:5174');

        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS BLOCKED: Origin ${origin} not in whitelist: ${whitelist}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = {
    // Set security HTTP headers
    helmet: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // React requires inline for HMR in dev
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:", "http:"],
                connectSrc: ["'self'", "https://api.cloudinary.com", "http:", "ws:"]
            }
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }),

    // Enable CORS
    cors: cors(corsOptions),

    // Sanitize data against NoSQL query injection
    mongoSanitize: mongoSanitize(),

    // Prevent HTTP Parameter Pollution
    hpp: hpp(),

    // Rate limiters
    generalLimiter,
    authLimiter,
    registerLimiter,
    otpLimiter,
    xssClean
};
