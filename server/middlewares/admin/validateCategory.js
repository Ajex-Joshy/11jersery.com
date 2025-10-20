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
    maxRedeemable,
  } = req.body || {};

  if (title !== undefined && typeof title !== "string") {
    errors.push("Title must be a string");
  }

  if (
    cloudinaryImageId !== undefined &&
    typeof cloudinaryImageId !== "string"
  ) {
    errors.push("cloudinaryImageId must be a string");
  }

  if (isListed !== undefined && !validator.isBoolean(String(isListed))) {
    errors.push("isListed must be a boolean");
  }

  if (inHome !== undefined && !validator.isBoolean(String(inHome))) {
    errors.push("inHome must be a boolean");
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
      maxRedeemable === undefined ||
      maxRedeemable === null ||
      Number(maxRedeemable) <= 0
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
