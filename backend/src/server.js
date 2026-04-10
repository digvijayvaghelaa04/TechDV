const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

// Load environment variables immediately
require('dotenv').config();

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./utils/errorHandler');
const security = require('./middleware/security');

const passport = require('passport');

// Connect to database
connectDB();

// Passport config
require('./config/passport')(passport);

const app = express();

app.use(passport.initialize());

// ==========================================
// 🛡️ SECURITY MIDDLEWARE
// ==========================================
app.use(security.helmet);
app.use(security.cors);
app.use(security.mongoSanitize);
app.use(security.hpp);
app.use(security.xssClean);

// Global Rate Limiting
app.use(security.generalLimiter);

// ==========================================
// ⚙️ CORE MIDDLEWARE
// ==========================================

// Stripe webhook MUST receive the raw body for signature verification.
// This must be registered before any JSON/body parsers.
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

// Parse request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request Logging
app.use(morgan('combined', { stream: logger.stream }));

// Serve static files (Securely)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Protect local course assets (Videos/Notes). Requires Auth Token via Cookie or Query Param
app.use('/cource-data', require('./middleware/auth').protect, express.static(path.join(__dirname, '../../cource-data')));

// ==========================================
// 🏥 HEALTH CHECK
// ==========================================
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'TechDV LMS API',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: dbStatus,
    memory: process.memoryUsage()
  });
});

// ==========================================
// 🛣️ ROUTES
// ==========================================
const auth = require('./routes/auth');
const courses = require('./routes/courses');
const enrollments = require('./routes/enrollments');
const orders = require('./routes/orders');
const instructors = require('./routes/instructors');
const payment = require('./routes/payment');
const coupons = require('./routes/coupons');
const stream = require('./routes/stream');
const analytics = require('./routes/analytics');
const upload = require('./routes/upload'); // New Upload Route
const progress = require('./routes/progress');
const live = require('./routes/live');

app.use('/api/v1/auth', auth);
app.use('/api/v1/courses', courses);
app.use('/api/v1/enrollments', enrollments);
app.use('/api/v1/orders', orders);
app.use('/api/v1/instructors', instructors);
app.use('/api/v1/payment', payment);
app.use('/api/v1/coupons', coupons);
app.use('/api/v1/video', stream);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/upload', upload); // Mount Upload Route
app.use('/api/v1/progress', progress);
app.use('/api/v1/live', live);

// ==========================================
// 🚫 ERROR HANDLING
// ==========================================
// Handle 404
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

// ==========================================
// 🚀 SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;

let server;

// Only start the server if this file is run directly (not imported by supertest/jest)
if (require.main === module) {
  server = app.listen(PORT, () => {
    logger.info(`🚀 TechDV API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  // Socket.io Integration for Live Broadcasts
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(o => o.trim()) : ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_live', (channel) => {
      socket.join(channel);
      logger.info(`User joined live channel: ${channel}`);
    });

    socket.on('live_chat_message', (data) => {
      // data: { channel, user: { name, avatar }, message }
      io.to(data.channel).emit('live_chat_message', data);
    });

    socket.on('leave_live', (channel) => {
      socket.leave(channel);
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle SIGTERM (e.g. Docker shutdown)
  process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received. Shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
    });
  });
}

// Export app for testing purposes
module.exports = app;
