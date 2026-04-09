const express = require('express');
const {
    getBroadcasts,
    createBroadcast,
    updateBroadcast,
    getLiveToken
} = require('../controllers/live');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All live routes require authentication
router.use(protect);

router
    .route('/')
    .get(getBroadcasts)
    .post(authorize('instructor', 'admin', 'super_admin'), createBroadcast);

router
    .route('/:id')
    .put(authorize('instructor', 'admin', 'super_admin'), updateBroadcast);

router.get('/token/:channelName', getLiveToken);

module.exports = router;
