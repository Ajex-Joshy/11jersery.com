import { signupUser } from "../../services/user/authServices.js";

export const userSignupController = async (req, res, next) => {
  try {
    const { user, token } = await signupUser(req.body);

    res.status(201).json({
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};
