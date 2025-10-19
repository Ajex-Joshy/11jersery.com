import User from "../../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/appError.js";
import { generateToken } from "../../utils/jwt.js";

export const signupUser = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
  gender,
  dob,
  photoUrl,
}) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      409,
      "EMAIL_ALREADY_EXISTS",
      "A user with this email address already exists."
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    gender,
    dob,
    photoUrl,
  });

  const token = generateToken({ id: newUser._id });

  return { user: newUser, token };
};
