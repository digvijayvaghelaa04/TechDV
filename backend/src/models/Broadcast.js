const mongoose = require('mongoose');

const BroadcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a broadcast title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    instructor: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    channelName: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'ended'],
        default: 'scheduled'
    },
    scheduledFor: {
        type: Date,
        default: Date.now
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    },
    participants: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    thumbnail: {
        type: String,
        default: 'no-photo.jpg'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Broadcast', BroadcastSchema);
