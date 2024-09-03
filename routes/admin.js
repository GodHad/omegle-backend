const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

// Get all users
router.get("/get_all_user", async (req, res) => {
    try {
        const users = await controllers.adminController.getAllUsers();
        return res.status(200).json(users);
    } catch (err) {
        const message = err.message || 'An error occurred';
        return res.status(400).json({
            statusCode: 400,
            message,
            error: "Bad Request"
        });
    }
});

// Update user status
router.post("/updateUserStatus", async (req, res) => {
    try {
        const { ipAddress, status } = req.body;
        const user = await controllers.adminController.updateUserStatus(ipAddress, status);
        return res.status(200).json(user);
    } catch (err) {
        const message = err.message || 'An error occurred';
        return res.status(400).json({
            statusCode: 400,
            message,
            error: "Bad Request"
        });
    }
});

module.exports = router;
