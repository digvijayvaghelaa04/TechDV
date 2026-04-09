const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../utils/errorHandler');

const fs = require('fs');

// STORAGE CONFIGURATION
// We store files locally first (in 'uploads' folder), then upload to Cloudinary
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: uuid + extension
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// FILE FILTERING
const fileFilter = (req, file, cb) => {
    // Logic based on field name or generally accepted types
    if (file.fieldname === 'avatar' || file.fieldname === 'thumbnail') {
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
            return cb(new AppError('Only image files are allowed!', 400), false);
        }
    } else if (file.fieldname === 'video' || file.fieldname === 'lessonVideo') {
        if (!file.mimetype.match(/^video\/(mp4|mkv|mov|avi|webm)$/)) {
            return cb(new AppError('Only video files are allowed!', 400), false);
        }
    } else if (file.fieldname === 'document') {
        if (!file.mimetype.match(/^application\/(pdf)$/)) {
            return cb(new AppError('Only PDF files are allowed!', 400), false);
        }
    }

    // Accept standard document types if needed later
    cb(null, true);
};

// LIMITS
const limits = {
    fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 // Default 10MB
};

// EXPORT MULTER INSTANCE
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

module.exports = upload;
