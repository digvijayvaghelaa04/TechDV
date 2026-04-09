const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

/**
 * Syncs an entire course curriculum array structure cleanly with the database.
 * Diffing existing modules/lessons, handling arrays and relationships natively,
 * without using raw db.transactions to support standalone Mongo.
 */
exports.syncCourseCurriculum = async (courseId, modulesPayload) => {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found for syncing");

    if (!Array.isArray(modulesPayload)) {
        return course.modules;
    }

    // 1. Array of all incoming valid ObjectIds from the payload
    const incomingModuleIds = modulesPayload.map(m => m._id).filter(id => id && String(id).length === 24);
    
    // Find existing modules to determine what needs deleting
    const existingModules = await Module.find({ course: courseId });
    const existingModuleIds = existingModules.map(m => m._id.toString());
    const modulesToDelete = existingModuleIds.filter(id => !incomingModuleIds.includes(id));
    
    // Process Lessons deletions
    const allIncomingLessonIds = [];
    modulesPayload.forEach(m => {
        if (m.lessons && Array.isArray(m.lessons)) {
            m.lessons.forEach(l => {
                if (l._id && String(l._id).length === 24) allIncomingLessonIds.push(l._id);
            });
        }
    });

    const existingLessons = await Lesson.find({ course: courseId });
    const existingLessonIds = existingLessons.map(l => l._id.toString());
    const lessonsToDelete = existingLessonIds.filter(id => !allIncomingLessonIds.includes(id));

    // 2. Perform deletions of removed nodes from UI
    if (lessonsToDelete.length > 0) {
        await Lesson.deleteMany({ _id: { $in: lessonsToDelete } });
    }
    if (modulesToDelete.length > 0) {
        await Module.deleteMany({ _id: { $in: modulesToDelete } });
    }

    // 3. Upsert Modules and Lessons
    const finalModuleIds = [];
    let totalCourseDuration = 0;
    
    for (let i = 0; i < modulesPayload.length; i++) {
        const mPayload = modulesPayload[i];
        let moduleDoc;
        
        if (mPayload._id && String(mPayload._id).length === 24) {
             moduleDoc = await Module.findById(mPayload._id);
        }
        
        if (moduleDoc) {
             moduleDoc.title = mPayload.title || moduleDoc.title;
             moduleDoc.order = i + 1; // force physical array index order
        } else {
             moduleDoc = new Module({
                 title: mPayload.title || `Module ${i+1}`,
                 course: courseId,
                 order: i + 1
             });
        }
        
        // Upsert child lessons
        const finalLessonIds = [];
        let moduleDuration = 0;
        
        if (mPayload.lessons && Array.isArray(mPayload.lessons)) {
             for (let j = 0; j < mPayload.lessons.length; j++) {
                 const lPayload = mPayload.lessons[j];
                 let lessonDoc;
                 
                 if (lPayload._id && String(lPayload._id).length === 24) {
                      lessonDoc = await Lesson.findById(lPayload._id);
                 }
                 
                 const durationNumber = parseInt(lPayload.videoDuration) || 0;

                 if (lessonDoc) {
                      lessonDoc.title = lPayload.title || lessonDoc.title;
                      lessonDoc.module = moduleDoc._id; // Ensure parent ref exists
                      lessonDoc.type = lPayload.type || lessonDoc.type;
                      lessonDoc.content = lPayload.content || lessonDoc.content;
                      lessonDoc.videoUrl = lPayload.videoUrl || lessonDoc.videoUrl;
                      lessonDoc.videoDuration = durationNumber;
                      lessonDoc.isFreePreview = lPayload.isFreePreview || false;
                      lessonDoc.order = j + 1;
                 } else {
                      lessonDoc = new Lesson({
                          title: lPayload.title || `Lesson ${j+1}`,
                          module: moduleDoc._id,
                          course: courseId,
                          type: lPayload.type || 'video',
                          content: lPayload.content || '',
                          videoUrl: lPayload.videoUrl || '',
                          videoDuration: durationNumber,
                          isFreePreview: lPayload.isFreePreview || false,
                          order: j + 1
                      });
                 }
                 
                 await lessonDoc.save();
                 finalLessonIds.push(lessonDoc._id);
                 moduleDuration += durationNumber;
             }
        }
        
        moduleDoc.lessons = finalLessonIds;
        moduleDoc.duration = moduleDuration;
        await moduleDoc.save();
        finalModuleIds.push(moduleDoc._id);
        totalCourseDuration += moduleDuration;
    }
    
    // 4. Conclude updates to course document
    course.modules = finalModuleIds;
    // Map seconds to minutes for course level estimation
    course.estimatedDuration = Math.round(totalCourseDuration / 60);
    
    await course.save();
    return course.modules;
};
