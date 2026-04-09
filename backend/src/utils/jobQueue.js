/**
 * TechDV LMS — In-Memory Job Queue (Demo/Dev)
 * 
 * A simple async job queue for background tasks like email, certificates,
 * and payment logs. In production, replace this with BullMQ + Redis.
 * 
 * Usage:
 *   const jobQueue = require('./jobQueue');
 *   jobQueue.add('send_email', { to: 'user@x.com', subject: 'Welcome' });
 */

const logger = require('./logger');

class JobQueue {
    constructor() {
        this.queue = [];
        this.handlers = {};
        this.running = false;
        this.interval = null;
    }

    /**
     * Register a handler for a job type
     * @param {string} type - Job type name
     * @param {Function} handler - Async handler function (receives job.data)
     */
    register(type, handler) {
        this.handlers[type] = handler;
        logger.info(`[JobQueue] Handler registered for: ${type}`);
    }

    /**
     * Add a job to the queue
     * @param {string} type - Job type (must have a registered handler)
     * @param {Object} data - Job payload data
     * @param {Object} [options] - Options: { delay: ms, retries: number }
     */
    add(type, data, options = {}) {
        const job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type,
            data,
            retries: options.retries || 2,
            delay: options.delay || 0,
            createdAt: new Date()
        };
        this.queue.push(job);
        logger.info(`[JobQueue] Job added: ${type} (id: ${job.id})`);
        if (!this.running) this._startProcessing();
        return job.id;
    }

    /**
     * Start the queue processor
     */
    _startProcessing() {
        this.running = true;
        this.interval = setInterval(async () => {
            if (this.queue.length === 0) {
                clearInterval(this.interval);
                this.running = false;
                return;
            }
            const job = this.queue.shift();
            await this._process(job);
        }, 500);
    }

    async _process(job) {
        const handler = this.handlers[job.type];
        if (!handler) {
            logger.warn(`[JobQueue] No handler for job type: ${job.type}`);
            return;
        }
        try {
            if (job.delay > 0) await new Promise(r => setTimeout(r, job.delay));
            await handler(job.data);
            logger.info(`[JobQueue] Job completed: ${job.type} (id: ${job.id})`);
        } catch (err) {
            logger.error(`[JobQueue] Job failed: ${job.type} — ${err.message}`);
            if (job.retries > 0) {
                job.retries--;
                job.delay = 2000; // backoff
                this.queue.unshift(job); // retry
                logger.warn(`[JobQueue] Retrying job: ${job.type} (${job.retries} retries left)`);
            }
        }
    }

    /**
     * Get queue status
     */
    status() {
        return { pending: this.queue.length, running: this.running };
    }
}

const queue = new JobQueue();

// Register built-in handlers
const emailService = require('./emailService');

queue.register('send_welcome_email', async ({ email, name }) => {
    await emailService.sendWelcomeEmail(email, name);
});

queue.register('send_password_reset_email', async ({ email, otp }) => {
    await emailService.sendPasswordResetEmail(email, otp);
});

queue.register('log_payment', async ({ userId, courseId, amount, method }) => {
    logger.info(`[Payment Log] User: ${userId} | Course: ${courseId} | Amount: ₹${amount} | Method: ${method}`);
});

queue.register('generate_certificate', async ({ userId, courseId, courseName }) => {
    // TODO: Replace with real certificate PDF generation in production
    logger.info(`[Certificate] Generating for User: ${userId}, Course: ${courseName}`);
});

module.exports = queue;
