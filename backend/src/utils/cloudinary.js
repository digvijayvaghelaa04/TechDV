const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const logger = require('./logger');

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    logger.warn('Cloudinary credentials missing. File uploads will fail in production.');
}

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - Path to local file
 * @param {string} folder - Cloudinary folder name
 * @returns {Object} Cloudinary response
 */
const uploadOnCloudinary = async (localFilePath, folder = 'techdv_defaults') => {
    try {
        if (!localFilePath) return null;

        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            // Development fallback: return null but DON'T delete the file
            // The controller will then use the local path as the URL
            logger.warn('Cloudinary not configured. Keeping file locally.');
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: `techdv/${folder}`
        });

        // File uploaded successfully, remove local file
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        logger.error(`Cloudinary Upload Error: ${error.message}`);
        // Remove the locally saved temporary file as the operation got failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary Public ID
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        logger.error(`Cloudinary Delete Error: ${error.message}`);
        return null;
    }
};

module.exports = {
    uploadOnCloudinary,
    deleteFromCloudinary
};
