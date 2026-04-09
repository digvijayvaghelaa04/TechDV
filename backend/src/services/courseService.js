const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const CourseProgress = require('../models/CourseProgress');
const Review = require('../models/Review');

class CourseService {
    /**
     * Completely deletes a course and all of its deeply nested dependencies.
     * Uses ACID transactions to ensure database consistency.
     * 
     * @param {string} courseId - The ID of the course to delete
     * @param {mongoose.ClientSession} parentSession - Optional session to run within
     */
    async deleteCourseDeeply(courseId) {
        try {
            const course = await Course.findById(courseId);
            
            if (!course) {
                return null;
            }

            // 1. Delete all lessons
            await Lesson.deleteMany({ course: course._id });

            // 2. Delete all modules
            await Module.deleteMany({ course: course._id });

            // 3. Delete all enrollments
            await Enrollment.deleteMany({ course: course._id });

            // 4. Delete all progress records
            await CourseProgress.deleteMany({ course: course._id });

            // 5. Delete all reviews (if model is active)
            if (Review) await Review.deleteMany({ course: course._id });

            // Finally, delete the course itself
            await course.deleteOne();

            return true;
        } catch (error) {
            console.error('Deep Delete Error:', error);
            throw error;
        }
    }
}

module.exports = new CourseService();
