import validator from "validator";
import { AppError } from "../../utils/helpers.js";

const validateCategory = (req, res, next) => {
  const errors = [];
  const {
    title,
    cloudinaryImageId,
    isListed,
    inHome,
    discount,
    discountType,
    maxReedemable,
  } = req.body || {};

  if (!title || typeof title !== "string") {
    errors.push("Title is required and must be a string");
  }

  if (!cloudinaryImageId || typeof cloudinaryImageId !== "string") {
    errors.push("cloudinaryImageId is required and must be a string");
  }

  if (
    typeof isListed === "undefined" ||
    !validator.isBoolean(String(isListed))
  ) {
    errors.push("isListed is required and must be a boolean");
  }

  if (typeof inHome === "undefined" || !validator.isBoolean(String(inHome))) {
    errors.push("inHome is required and must be a boolean");
  }

  if (
    discount !== undefined &&
    discount !== null &&
    !validator.isNumeric(String(discount))
  ) {
    errors.push("discount must be a number");
  }

  if (discount > 0) {
    if (!discountType || !["flat", "percent"].includes(discountType)) {
      errors.push(
        "discountType is required and must be either flat or percent when discount > 0"
      );
    }

    if (
      maxReedemable === undefined ||
      maxReedemable === null ||
      Number(maxReedemable) <= 0
    ) {
      errors.push(
        "maxRedeemable must be greater than 0 when discount is applied"
      );
    }
  }

  if (errors.length > 0) {
    throw new AppError(400, "VALIDATION_ERROR", errors[0]);
  }

  next();
};

export default validateCategory;
