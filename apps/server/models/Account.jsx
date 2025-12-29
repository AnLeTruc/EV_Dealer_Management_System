const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: function () {
            return this.role !== 'ADMIN';
        },
        index: true,
    },
    
    role: {
        type: String,
        enum: ['USER', 'ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER', 'EVMStaff'],
    },
}, { timestamps: true });

AccountSchema.pre('validate', function () {
    if (this.role === 'ADMIN') {
        this.branch = undefined;
    }
});

module.exports = mongoose.model('Account', AccountSchema);