import User from "../../models/userModel.js";

const checkUserStatus = async (req, res, next) => {
  try {
    // 'req.auth.userId' is added by Clerk's middleware
    const authId = req.auth.userId;

    if (!authId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(authId);

    if (!user) {
      // This could happen if the webhook is slow.
      return res.status(404).json({ error: "User not found in our system" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "This account is blocked." });
    }

    User.updateOne({ _id: authId }, { $set: { lastLogin: new Date() } }).exec();

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export default checkUserStatus;
