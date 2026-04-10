const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    var ffmpeg = require('ffmpeg-static');
} catch (e) {
    ffmpeg = null;
}

const getRealDuration = (filePath) => {
    if (!ffmpeg) return 600;
    try {
        execSync(`"${ffmpeg}" -i "${filePath}" 2>&1`, { encoding: 'utf8' });
    } catch (e) {
        const text = e.stdout || e.stderr || e.message;
        const match = text.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (match) {
            return Math.round(parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]));
        }
    }
    return 600; // fallback
};

// Load env vars
dotenv.config({ path: './.env' });

// Load models
const User = require('../../models/User');
const Course = require('../../models/Course');
const InstructorProfile = require('../../models/InstructorProfile');
const Order = require('../../models/Order');
const Enrollment = require('../../models/Enrollment');
const Earning = require('../../models/Earning');
const CourseProgress = require('../../models/CourseProgress');
const RefreshToken = require('../../models/RefreshToken');
const Module = require('../../models/Module');
const Lesson = require('../../models/Lesson');
const Payment = require('../../models/Payment');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
    try {
        // Clear all data
        await User.deleteMany();
        await Course.deleteMany();
        await InstructorProfile.deleteMany();
        await Order.deleteMany();
        await Enrollment.deleteMany();
        await Earning.deleteMany();
        await CourseProgress.deleteMany();
        await RefreshToken.deleteMany();
        await Module.deleteMany();
        await Lesson.deleteMany();
        await Payment.deleteMany();

        console.log('Database Cleaned...'.red.inverse);

        const sharedPassword = 'TechDVAdmin!2026';

        // 1. Create EXACTLY ONE Super Admin
        const superAdmin = await User.create({
            firstName: 'TechDV', lastName: 'SuperAdmin', username: 'superadmin',
            email: 'admin@techdv.in', password: sharedPassword,
            mobileNumber: '9999999999', role: 'super_admin', otp: { isVerified: true }
        });

        console.log('Super Admin Created!'.green);
        console.log(`Login ID: ${superAdmin.email}`);
        console.log(`Password: ${sharedPassword}`);

        // 2. RESTORE JAVASCRIPT COURSE (Authored by Super Admin)
        const course = await Course.create({
            title: 'The Complete JavaScript Bootcamp',
            description: `A comprehensive guide from absolute beginner to advanced JavaScript developer.`,
            instructor: superAdmin._id, // Assigned to Super Admin
            price: 4999,
            category: 'Development',
            level: 'All Levels',
            isPublished: true,
            thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
            estimatedDuration: 1800,
            createdAt: Date.now()
        });

        const videoDir = path.join(__dirname, '../../../..', 'cource-data', 'java-script', 'videos');
        let videoFiles = [];
        if (fs.existsSync(videoDir)) {
            const rawFiles = fs.readdirSync(videoDir).filter(f => f.endsWith('.mp4'));
            const parsedFiles = rawFiles.map(f => {
                let m = f.match(/Lecture-?(\d+)/i);
                let num = m ? parseInt(m[1], 10) : (f.includes('Last-Lecture') ? 999 : (f.includes('Lecture-1') ? 1 : 0));
                return { f, num };
            });
            parsedFiles.sort((a, b) => a.num - b.num);
            videoFiles = parsedFiles.map(p => p.f);
        } else {
            console.log(`WARNING: Video directory not found at ${videoDir}`.yellow);
        }

        const notesFiles = [
            'JS1_ClassNotes.pdf', 'JS2_ClassNotes.pdf', 'JS3_ClassNotes.pdf',
            'JS4_ClassNotes.pdf', 'JS5_ClassNotes.pdf', 'JS6_ClassNotes.pdf',
            'JS7_ClassNotes.pdf', 'JS11_Class_Notes.pdf', 'JS12_ClassNotes.pdf'
        ];

        const module = await Module.create({
            title: `Module 1: JavaScript Fundamentals Complete`,
            course: course._id,
            order: 1
        });

        const lessons = [];
        let totalCourseDuration = 0;
        let noteIdx = 0;

        for (let l = 1; l <= Math.max(videoFiles.length, 5); l++) {
            const videoName = videoFiles[l - 1] || `placeholder_${l}.mp4`;
            const dynamicTitle = videoName.replace(/-/g, ' ').replace('.mp4', '').replace(/JavaScript Full Course/gi, '').trim() || `Lesson ${l}`;

            let resources = [];
            if (noteIdx < notesFiles.length) {
                resources.push({
                    title: 'Download Class Notes',
                    url: `/cource-data/java-script/notes/${notesFiles[noteIdx++]}`
                });
            }

            const dbVideoUrl = `/cource-data/java-script/videos/${videoName}`;
            const diskPath = path.join(videoDir, videoName);
            const realDur = fs.existsSync(diskPath) ? getRealDuration(diskPath) : 600;
            totalCourseDuration += realDur;

            const lesson = await Lesson.create({
                title: `Lesson ${l}: ${dynamicTitle}`,
                module: module._id,
                course: course._id,
                type: 'video',
                videoUrl: dbVideoUrl,
                content: 'Detailed explanation regarding this topic in JavaScript.',
                videoDuration: realDur,
                order: l,
                isFreePreview: l <= 2,
                resources: resources
            });
            lessons.push(lesson._id);
        }
        
        module.lessons = lessons;
        await module.save();
        
        course.modules = [module._id];
        course.estimatedDuration = totalCourseDuration;
        await course.save();

        console.log('Course and Curriculum Restored successfully!'.green);

        console.log('System Restored to Absolute Zero + 1 Super Admin & 1 Course!'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.inverse);
        process.exit(1);
    }
};

const args = process.argv.slice(2);
if (process.env.NODE_ENV === 'production') {
    console.log('❌ ERROR: Seeding is strictly disabled in production!'.red.inverse);
    process.exit(1);
}

if (args.includes('-force')) {
    importData();
} else {
    console.log('⚠️  WARNING: Running the seeder will DESTROY current DB data.'.yellow);
    console.log('To confirm and execute the seed, run exactly: node database/seeds/seeder.js -force'.cyan);
    process.exit(0);
}
