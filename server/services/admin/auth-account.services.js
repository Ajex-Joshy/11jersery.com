import Admin from "../../models/admin.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";

export const loginAdmin = async (identifier, password) => {
  try {
    const admin = await Admin.findOne({ email: identifier });
    if (!admin)
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect)
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;
    const token = generateToken({ id: admin._id }, "2d");
    return { data: { admin: adminWithoutPassword, token } };
  } catch (error) {
    throw error;
  }
};
