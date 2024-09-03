const { User } = require("../models");

const getAllUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error("Error fetching users");
    }
};

const updateUserStatus = async (ipAddress, status) => {
    try {
        return await User.findOneAndUpdate({ ipAddress }, { status }, { new: true });
    } catch (error) {
        throw new Error("Error updating user status");
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
};
