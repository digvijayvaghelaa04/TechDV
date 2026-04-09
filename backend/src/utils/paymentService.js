const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const logger = require('./logger');

class PaymentService {
    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            logger.warn('Stripe secret key missing.');
        }

        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            this.razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            this.razorpayEnabled = true;
            logger.info('Razorpay initialized for TechDV.');
        } else {
            logger.warn('Razorpay credentials missing. Razorpay payments will fail.');
            this.razorpayEnabled = false;
        }
    }

    /**
     * Create Razorpay Order (Preferred for India)
     */
    async createRazorpayOrder(amount, currency = 'INR', receipt, metadata = {}) {
        if (!this.razorpayEnabled) {
            throw new Error('Razorpay is not configured');
        }

        const options = {
            amount, // in paise
            currency,
            receipt,
            notes: metadata
        };

        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        } catch (error) {
            logger.error(`Razorpay Create Order Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create Payment Intent (Stripe Fallback/Global)
     * @param {number} amount - Amount in cents (paise for INR)
     * @param {string} currency - Currency code
     * @param {string} receipt_email - Customer email
     * @returns {Promise<Object>} Payment Intent
     */
    async createPaymentIntent(amount, currency = 'inr', receipt_email, metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                receipt_email,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            return paymentIntent;
        } catch (error) {
            logger.error(`Stripe Create Intent Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Construct Webhook Event (Stripe)
     */
    constructEvent(rawBody, signature) {
        try {
            return stripe.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            logger.error(`Stripe Webhook Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify Razorpay Signature
     */
    verifyRazorpaySignature(orderId, paymentId, signature) {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(orderId + "|" + paymentId);
        const generatedSignature = hmac.digest('hex');
        return generatedSignature === signature;
    }
}

module.exports = new PaymentService();
