const express = require('express');
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');

// Include other resource routers
const moduleRouter = require('./modules');
const reviewRouter = require('./reviews');

const router = express.Router();

const { protect, hasPermission } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:courseId/modules', moduleRouter);
router.use('/:courseId/reviews', reviewRouter);

router
    .route('/')
    .get(getCourses)
    .post(protect, hasPermission('canAddCourse'), createCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, hasPermission('canUpdateCourse'), updateCourse)
    .delete(protect, hasPermission('canDeleteCourse'), deleteCourse);

module.exports = router;
