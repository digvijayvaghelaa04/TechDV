const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');

dotenv.config();

const populate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const coursesData = [
            {
                pattern: /Web Development|Frontend/i,
                modules: [
                    {
                        title: 'HTML & CSS Masterclass',
                        lessons: [
                            { title: 'HTML5 Complete Tutorial', videoUrl: 'https://www.youtube.com/watch?v=HcOc7P5BMi4', type: 'video', videoDuration: 7200, order: 1 },
                            { title: 'CSS3 Full Course', videoUrl: 'https://www.youtube.com/watch?v=vLqTADJFfod', type: 'video', videoDuration: 21600, order: 2 },
                            { title: 'Flexbox & Grid Explained', videoUrl: 'https://www.youtube.com/watch?v=G3e-cpL7Atc', type: 'video', videoDuration: 3600, order: 3 }
                        ]
                    },
                    {
                        title: 'Modern JavaScript (ES6+)',
                        lessons: [
                            { title: 'JavaScript (Complete One Shot)', videoUrl: 'https://www.youtube.com/watch?v=ESL_qgG2LzU', type: 'video', videoDuration: 28800, order: 1 },
                            { title: 'Async JS & APIs', videoUrl: 'https://www.youtube.com/watch?v=376Sia0_lH8', type: 'video', videoDuration: 5400, order: 2 }
                        ]
                    }
                ]
            },
            {
                pattern: /React/i,
                modules: [
                    {
                        title: 'Modern React Architecture',
                        lessons: [
                            { title: 'React JS Full Course (9 Hours)', videoUrl: 'https://www.youtube.com/watch?v=K3S1Wf3mwW8', type: 'video', videoDuration: 32400, order: 1 },
                            { title: 'React Router & Global State', videoUrl: 'https://www.youtube.com/watch?v=fS_n-hS7vXU', type: 'video', videoDuration: 4500, order: 2 },
                            { title: 'Final Capstone Project', videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk', type: 'video', videoDuration: 10800, order: 3 }
                        ]
                    }
                ]
            },
            {
                pattern: /Python/i,
                modules: [
                    {
                        title: 'Python Core Protocol',
                        lessons: [
                            { title: 'Python for Beginners (Full Course)', videoUrl: 'https://www.youtube.com/watch?v=vLqTADJFfod', type: 'video', videoDuration: 21600, order: 1 },
                            { title: 'Advanced File Handling', videoUrl: 'https://www.youtube.com/watch?v=ESL_qgG2LzU', type: 'video', videoDuration: 3600, order: 2 }
                        ]
                    }
                ]
            },
            {
                pattern: /DevOps/i,
                modules: [
                    {
                        title: 'Infrastructure & CI/CD',
                        lessons: [
                            { title: 'DevOps Roadmap 2026', videoUrl: 'https://www.youtube.com/watch?v=9pZ2xmsSDdo', type: 'video', videoDuration: 1800, order: 1 },
                            { title: 'Docker & Kubernetes Essentials', videoUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo', type: 'video', videoDuration: 14400, order: 2 }
                        ]
                    }
                ]
            },
            {
                pattern: /Data Science|AI/i,
                modules: [
                    {
                        title: 'Intelligence & Insights',
                        lessons: [
                            { title: 'Machine Learning Masterclass', videoUrl: 'https://www.youtube.com/watch?v=GwIo3gDZCVQ', type: 'video', videoDuration: 18000, order: 1 },
                            { title: 'D3.js Visualization Protocol', videoUrl: 'https://www.youtube.com/watch?v=2LhoCfjm8Bc', type: 'video', videoDuration: 7200, order: 2 }
                        ]
                    }
                ]
            }
        ];

        for (const cData of coursesData) {
            const course = await Course.findOne({ title: cData.pattern });
            if (!course) {
                console.log(`Course matching ${cData.pattern} not found, skipping.`);
                continue;
            }

            console.log(`Populating: ${course.title}`);

            // Clear existing
            await Module.deleteMany({ course: course._id });
            await Lesson.deleteMany({ course: course._id });

            const moduleIds = [];
            for (const mData of cData.modules) {
                const module = await Module.create({
                    title: mData.title,
                    course: course._id,
                    order: moduleIds.length + 1
                });

                const lessonIds = [];
                for (const lData of mData.lessons) {
                    const lesson = await Lesson.create({
                        ...lData,
                        module: module._id,
                        course: course._id
                    });
                    lessonIds.push(lesson._id);
                }

                module.lessons = lessonIds;
                await module.save();
                moduleIds.push(module._id);
            }

            course.modules = moduleIds;
            await course.save();
        }

        console.log('✅ All courses updated with Apna College videos!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

populate();
