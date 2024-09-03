let onlineUsers = [];
let unpairedUsers = [];

const addUser = (socketId) => {
    if (onlineUsers.some(user => user._id === socketId)) {
        return { error: "Userid is taken" };
    }
    const user = { _id: socketId, type: 0 };
    onlineUsers.push(user);
    return { user };
};

const addUnpairedUser = (user) => {
    if (unpairedUsers.some(u => u.socketId === user.socketId)) {
        return { error: "Please wait connection..." };
    }
    unpairedUsers.push(user);
    return {};
};

const removeUser = (socketId) => {
    const user = onlineUsers.find(user => user._id === socketId);
    onlineUsers = onlineUsers.filter(user => user._id !== socketId);
    return user;
};

const removeUnpairedUser = (socketId) => {
    unpairedUsers = unpairedUsers.filter(user => user.socketId !== socketId);
};

const checkExistsUser = (userId) => onlineUsers.some(user => user._id === userId);

const getUsers = () => onlineUsers;

const getUnpairedUser = (newUser) => {
    const compareTime = Date.now() - newUser.startTime;
    return unpairedUsers.find(user => (
        user.socketId !== newUser.socketId &&
        user.type === newUser.type &&
        (
            (compareTime <= 5000 && user.interests === newUser.interests) || 
            (compareTime > 5000 && (user.interests === '' || user.interests === newUser.interests))
        )
    ));
};

module.exports = {
    checkExistsUser,
    removeUser,
    addUser,
    getUsers,
    addUnpairedUser,
    getUnpairedUser,
    removeUnpairedUser,
};
