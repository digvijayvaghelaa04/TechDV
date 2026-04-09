const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadVideo = (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, {
            resource_type: "video",
            chunk_size: 6000000,
            folder: "techdv_courses"
        }, function (error, result) {
            if (error) reject(error);
            else resolve(result);
        });
    });
};

const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');

const updateVideos = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const course = await Course.findOne({ title: /JavaScript Bootcamp/i }).populate({
            path: 'modules',
            populate: { path: 'lessons' }
        });

        if (!course) {
            console.log('Course not found');
            process.exit(1);
        }

        const videoDir = 'c:\\Users\\dv735\\Downloads\\TechDV\\cd\\cource-data\\java-script\\videos';
        const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));

        console.log(`Found ${files.length} videos. Need to upload them...`);

        // Test with the first file only to see if Cloudinary allows it or throws length quota limit
        const testFile = path.join(videoDir, 'videoplayback__0_.mp4');
        console.log(`Uploading ${testFile}...`);

        const result = await uploadVideo(testFile);
        console.log('Success!', result.secure_url);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateVideos();
