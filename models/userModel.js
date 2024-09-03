const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        default: ''
    },
    last_login_machine_info: {
        type: String,
        default: ''
    },
    socketId: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// JWT token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const User = mongoose.model("User", userSchema);
module.exports = User