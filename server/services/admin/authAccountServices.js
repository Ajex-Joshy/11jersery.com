import Admin from "../../models/adminModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/appError.js";

export const loginAdmin = async (email, password) => {
  try {
    const admin = await Admin.findOne({ email });
    if (!admin)
      throw new AppError(
        400,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect)
      throw new AppError(
        400,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    const adminWithoutPassword = admin.toObject();
    delete adminWithoutPassword.password;
    const token = generateToken({ id: admin._id });
    return { data: { admin: adminWithoutPassword, token } };
  } catch (error) {
    throw error;
  }
};
