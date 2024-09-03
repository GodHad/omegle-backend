const { User } = require("../models");
require("dotenv").config();
const adminIP = process.env.ADMIN_IP;

const loginUser = async (userAgent, locationInfo) => {
    const { country, regionName: state, city, query: ipAddress } = locationInfo;
    let user = await User.findOne({ ipAddress });
    
    if (!user) {
        user = await createUser({ ipAddress, last_login_machine_info: userAgent, country, state, city });
        return { success: true, result: { ...user._doc, admin: adminIP === ipAddress } };
    }

    if (user.status) {
        return { success: false, message: "Unfortunately, Your IP Address has been banned!" };
    }

    user = await User.findOneAndUpdate({ ipAddress }, { last_login_machine_info: userAgent }, { new: true });
    return { success: true, result: { ...user._doc, admin: adminIP === ipAddress } };
};

const createUser = async (userone) => {
    const newUser = new User(userone);
    return newUser.save();
};

module.exports = {
    loginUser,
    createUser,
};
