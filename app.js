const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const socketSetup = require("./socket");
const mongoose = require('mongoose');

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}

// Import routers
const loginRouter = require('./routes/login');
const adminRouter = require('./routes/admin');

// Database connection
mongoose.connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
    {}
).then(() => {
    console.log("Connected successfully to MongoDB!");
}).catch(console.error.bind(console, "connection error: "));

const app = express();
const server = createServer(app);

// Middleware
app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Routes
app.use(loginRouter);
app.use(adminRouter);

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Setup Socket.IO
socketSetup(server);
