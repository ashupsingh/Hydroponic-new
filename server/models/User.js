const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    deviceOrder: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    userNumber: {
        type: Number,
        unique: true
    }
}, { timestamps: true });

// Auto-increment userNumber before saving
// Auto-increment userNumber before saving
UserSchema.pre('save', async function () {
    if (this.isNew && !this.userNumber) {
        const lastUser = await this.constructor.findOne({}, {}, { sort: { 'userNumber': -1 } });
        this.userNumber = lastUser ? lastUser.userNumber + 1 : 1;
    }
});

module.exports = mongoose.model('User', UserSchema);
