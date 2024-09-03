const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

// When user login
router.post("/login", async (req, res) => {
    const userAgent = req.headers['user-agent'];
    const locationInfo = req.body;

    try {
        const result = await controllers.userController.loginUser(userAgent, locationInfo);
        if (result.success) {
            return res.status(200).json(result.result);
        } else {
            return res.status(401).json({ message: result.message });
        }
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
