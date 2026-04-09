const Broadcast = require('../models/Broadcast');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

// @desc    Get all active broadcasts
// @route   GET /api/v1/live
// @access  Private
exports.getBroadcasts = asyncHandler(async (req, res, next) => {
    const broadcasts = await Broadcast.find({ status: { $ne: 'ended' } })
        .populate({
            path: 'instructor',
            select: 'name avatar'
        })
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: broadcasts.length,
        data: broadcasts
    });
});

// @desc    Create a new broadcast
// @route   POST /api/v1/live
// @access  Private/Instructor
exports.createBroadcast = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.instructor = req.user.id;
    
    // Generate a unique channelName
    const channelName = `techdv_${req.user.id}_${Math.floor(Math.random() * 1000000)}`;
    req.body.channelName = channelName;

    const broadcast = await Broadcast.create(req.body);

    res.status(201).json({
        success: true,
        data: broadcast
    });
});

// @desc    Update broadcast status
// @route   PUT /api/v1/live/:id
// @access  Private/Instructor
exports.updateBroadcast = asyncHandler(async (req, res, next) => {
    let broadcast = await Broadcast.findById(req.params.id);

    if (!broadcast) {
        return next(new ErrorResponse(`Broadcast not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is broadcast instructor
    if (broadcast.instructor.toString() !== req.user.id && req.user.role !== 'super_admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this broadcast`, 401));
    }

    if (req.body.status === 'live' && broadcast.status !== 'live') {
        req.body.startedAt = Date.now();
    } else if (req.body.status === 'ended' && broadcast.status !== 'ended') {
        req.body.endedAt = Date.now();
    }

    broadcast = await Broadcast.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: broadcast
    });
});

// @desc    Get Agora Token
// @route   GET /api/v1/live/token/:channelName
// @access  Private
exports.getLiveToken = asyncHandler(async (req, res, next) => {
    const appID = process.env.AGORA_APP_ID || 'dummy_app_id';
    const appCertificate = process.env.AGORA_APP_CERT || 'dummy_app_cert';
    const channelName = req.params.channelName;
    const uid = 0; // Use 0 to let Agora dynamically assign a UID, or pass string user ID if using string UIDs
    const role = req.user.role === 'instructor' || req.user.role === 'super_admin' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    if (!channelName) {
        return next(new ErrorResponse(`Channel name is required`, 400));
    }

    if (appID === 'dummy_app_id') {
        // If no Agora credentials securely provided yet, just return dummy token for UI structural testing
        return res.status(200).json({
            success: true,
            data: {
                token: 'mock-agora-token',
                appId: appID,
                channelName,
                uid
            }
        });
    }

    const token = RtcTokenBuilder.buildTokenWithUid(
        appID, 
        appCertificate, 
        channelName, 
        uid, 
        role, 
        privilegeExpiredTs
    );

    res.status(200).json({
        success: true,
        data: {
            token,
            appId: appID,
            channelName,
            uid
        }
    });
});
