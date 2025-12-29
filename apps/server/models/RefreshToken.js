const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    jti: {
        type: String,
        required: true,
        unique: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    expiresAt:{
        type: Date,
        required: true
    },
    revokeAt:{
        type: Date,
        default: null
    },
}, { timestamps: true });

//Auto remove expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);