import validator from "validator";

export const validateLoginData = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw { code: "VALIDATION_ERROR", message: "All fields are required" };
    if (!validator.isEmail(email))
      throw { code: "VALIDATION_ERROR", message: "Enter a valid email" };
    next();
  } catch (err) {
    next(err);
  }
};
