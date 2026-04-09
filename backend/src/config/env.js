// config/env.js
/**
 * Aurora LMS - Environment Configuration
 * Centralized environment variable management
 */

require('dotenv').config();

const config = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  APP_NAME: 'TechDV',
  API_VERSION: 'v1',

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:5173/admin',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aurora-lms',
  MONGODB_URI_TEST: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/aurora-lms-test',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'aurora-lms-jwt-secret-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'aurora-lms-refresh-secret-key',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7, // days

  // Email Verification & Password Reset Token Expiry
  EMAIL_VERIFY_EXPIRE: process.env.EMAIL_VERIFY_EXPIRE || '24h',
  PASSWORD_RESET_EXPIRE: parseInt(process.env.PASSWORD_RESET_EXPIRE, 10) || 10, // minutes

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_SUCCESS_URL: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/payment/success',
  STRIPE_CANCEL_URL: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/payment/cancel',

  // Razorpay (Alternative Payment Gateway)
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

  // Email Service Configuration (SendGrid)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@techdv.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'TechDV',

  // SMTP Configuration (Alternative to SendGrid)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',

  // Redis Configuration (Optional - for caching & sessions)
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10, // Auth endpoints

  // File Upload Limits
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB (images/docs)
  MAX_VIDEO_SIZE: parseInt(process.env.MAX_VIDEO_SIZE, 10) || 500 * 1024 * 1024, // 500MB (videos)
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

  // Sentry Error Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.NODE_ENV,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  ENABLE_CORS: process.env.ENABLE_CORS !== 'false',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],

  // Features Flags
  ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
  ENABLE_2FA: process.env.ENABLE_2FA === 'true',
  ENABLE_WEBSOCKETS: process.env.ENABLE_WEBSOCKETS !== 'false',
  ENABLE_CACHING: process.env.ENABLE_CACHING === 'true',

  // Pagination Defaults
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 10,
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,

  // Course Settings
  COURSE_VIDEO_COMPLETE_THRESHOLD: parseFloat(process.env.COURSE_VIDEO_COMPLETE_THRESHOLD) || 0.9, // 90%
  CERTIFICATE_COMPLETION_THRESHOLD: parseInt(process.env.CERTIFICATE_COMPLETION_THRESHOLD, 10) || 100, // 100%

  // Payment Settings
  REFUND_WINDOW_DAYS: parseInt(process.env.REFUND_WINDOW_DAYS, 10) || 30,
  CURRENCY: process.env.CURRENCY || 'USD',
  CURRENCY_SYMBOL: process.env.CURRENCY_SYMBOL || '$',
};

// Validation: Check required environment variables in production
if (config.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'STRIPE_SECRET_KEY',
    'SENDGRID_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
}

module.exports = config;
