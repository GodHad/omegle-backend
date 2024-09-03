const { addUser, removeUser, getUsers, addUnpairedUser, getUnpairedUser, removeUnpairedUser, checkExistsUser } = require("./users");

const userIntervals = new Map();

const clearUserIntervals = (socketId) => {
    if (userIntervals.has(socketId)) {
        clearInterval(userIntervals.get(socketId));
        userIntervals.delete(socketId);
    } else {
        cleanUpInvalidUserIntervals();
    }
};

const cleanUpInvalidUserIntervals = () => {
    for (const [key, interval] of userIntervals) {
        if (!checkExistsUser(key)) {
            clearInterval(interval);
            userIntervals.delete(key);
        }
    }
};

module.exports = function (server) {
    const io = require("socket.io")(server, {
        cors: {
            origin: process.env.FRONTEND_URL
        }
    });

    io.on('connection', (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);

        socket.on("new-online-user", (user, callback) => {
            const { error } = addUser(socket.id);
            if (error) return callback({ error });

            const onlineUsers = getUsers();
            io.to(socket.id).emit('get-user-id', socket.id);
            io.emit("get-online-users", onlineUsers);
            callback();
        });

        socket.on("pairing-user", (user, type, interests, callback) => {
            if (!user) return;

            const sender = {
                ...user,
                socketId: socket.id,
                type,
                interests,
                startTime: Date.now(),
                vis: 0
            };

            removeUnpairedUser(socket.id);
            clearUserIntervals(socket.id);

            const { error } = addUnpairedUser(sender);
            if (error) return callback(error);

            const findPairUser = setInterval(() => {
                const receiver = getUnpairedUser(sender);

                if (receiver) {
                    clearInterval(findPairUser);
                    clearUserIntervals(sender.socketId);
                    clearUserIntervals(receiver.socketId);

                    io.to(sender.socketId).emit("user-paired", JSON.stringify(receiver), "sender");
                    removeUnpairedUser(receiver.socketId);

                    io.to(receiver.socketId).emit("user-paired", JSON.stringify(sender), "receiver");
                    removeUnpairedUser(sender.socketId);
                }
            }, 1000);

            userIntervals.set(socket.id, findPairUser);
        });

        socket.on("unpairing-user", (socketId, callback) => {
            clearUserIntervals(socketId);
            clearUserIntervals(socket.id);
            removeUnpairedUser(socketId);
            callback();
        });

        socket.on("send-message", (receiver, message, callback) => {
            if (!checkExistsUser(receiver)) return callback();

            io.to(receiver).emit("send-message", message);
            io.to(socket.id).emit("receive-message", message);

            callback();
        });

        socket.on("callUser", (signal, receiver, callback) => {
            if (!checkExistsUser(receiver)) return callback();
            io.to(receiver).emit('get-video-stream', signal);
        });

        socket.on("answerCall", (data) => {
            io.to(data.to).emit("callAccepted", data.signal);
        });

        socket.on("chat-close", (userId, callback) => {
            io.to(userId).emit("chat-close");
            clearUserIntervals(userId);
            clearUserIntervals(socket.id);
            callback();
        });

        socket.on("typing", (userId) => {
            io.to(userId).emit("typing");
        });

        socket.on("typing stop", (userId) => {
            io.to(userId).emit("typing stop");
        });

        socket.on("screen-off", () => {
            const user = removeUser(socket.id);
            if (user) {
                removeUnpairedUser(user._id);
                clearUserIntervals(socket.id);
                io.emit("get-online-users", getUsers());
            }
        });

        socket.on("offline", () => {
            const user = removeUser(socket.id);
            if (user) {
                removeUnpairedUser(socket.id);
                clearUserIntervals(socket.id);
                io.emit("get-online-users", getUsers());
            }
        });

        socket.on("disconnect", () => {
            const user = removeUser(socket.id);
            if (user) {
                removeUnpairedUser(socket.id);
                clearUserIntervals(socket.id);
                io.emit("get-online-users", getUsers());
                console.log('🔥: A user disconnected');
            }
        });
    });
};
