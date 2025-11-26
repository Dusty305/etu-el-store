import mongoose from 'mongoose';

export default new mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        maxlength: 60
    },
    displayName: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 60
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ПОКУПАТЕЛЬ', 'АДМИНИСТРАТОР'],
        default: 'ПОКУПАТЕЛЬ'
    }
}, {
    timestamps: true
});