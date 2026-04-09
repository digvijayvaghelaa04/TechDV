const express = require('express');
const {
    getModules,
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/modules');

// Include other resource routers
const lessonRouter = require('./lessons');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:moduleId/lessons', lessonRouter);

router
    .route('/')
    .get(getModules)
    .post(protect, authorize('instructor', 'admin', 'super_admin'), createModule);

router
    .route('/:id')
    .put(protect, authorize('instructor', 'admin', 'super_admin'), updateModule)
    .delete(protect, authorize('instructor', 'admin', 'super_admin'), deleteModule);

module.exports = router;
