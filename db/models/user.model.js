import mongoose from "mongoose";

const options = {
    collection: "users",
    strict: true,
    collation: {
        locale: "en",
        strength: 1
    }
};

export const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    refreshTokens: {
        type: [{
            id: {type: String},
            token: {type: String},
            expiresAt: {type: Date}
        }],
        default: []
    }
}, {timestamps: true}, options);

export const User = mongoose.model('User', userSchema);