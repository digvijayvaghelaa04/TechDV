const twilio = require('twilio');
const logger = require('./logger');

class SmsService {
    constructor() {
        this.client = null;
        this.enabled = false;

        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            this.enabled = true;
            this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        } else {
            logger.warn('Twilio credentials missing. SMS service disabled. OTPs will be logged to console.');
        }
    }

    /**
     * Send SMS
     * @param {string} to - Recipient phone number
     * @param {string} message - Message content
     */
    async sendSMS(to, message) {
        if (!this.enabled) {
            logger.info(`[DEV MODE] Mock SMS to ${to}: ${message}`);
            return true; // Simulate success
        }

        try {
            await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });
            logger.info(`SMS sent successfully to ${to}`);
            return true;
        } catch (error) {
            logger.error(`Twilio SMS Error: ${error.message}`);
            throw new Error('Failed to send SMS');
        }
    }

    /**
     * Send OTP
     * @param {string} to - Recipient phone number
     * @param {string} otp - OTP code
     */
    async sendOTP(to, otp) {
        const message = `Your TechDV Verification Code is: ${otp}. Valid for 10 minutes.`;
        return this.sendSMS(to, message);
    }
}

module.exports = new SmsService();
