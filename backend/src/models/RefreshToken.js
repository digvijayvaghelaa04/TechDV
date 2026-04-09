const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    createdByIp: {
        type: String,
        required: true
    },
    revoked: {
        type: Date
    },
    revokedByIp: {
        type: String
    },
    replacedByToken: {
        type: String
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Virtual property to check if token is expired
refreshTokenSchema.virtual('expired').get(function () {
    return Date.now() >= this.expires;
});

// Virtual property to check if token is active
refreshTokenSchema.virtual('active').get(function () {
    return !this.revoked && !this.expired;
});

refreshTokenSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
        delete ret.user;
    }
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
