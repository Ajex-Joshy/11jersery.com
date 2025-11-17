import { validationOptions } from "../../../validators/admin/category-validator.js";

export const parseAndValidateCategoryData = (dataFromRequest, schema) => {
  let data = { ...dataFromRequest };

  if (data.isListed !== undefined) data.isListed = data.isListed === "true";
  if (data.inHome !== undefined) data.inHome = data.inHome === "true";
  if (data.inCollections !== undefined)
    data.inCollections = data.inCollections === "true";

  if (data.discount !== undefined)
    data.discount =
      data.discount === null || data.discount === ""
        ? undefined
        : Number(data.discount);
  if (data.minPurchaseAmount !== undefined)
    data.minPurchaseAmount =
      data.minPurchaseAmount === null || data.minPurchaseAmount === ""
        ? undefined
        : Number(data.minPurchaseAmount);
  if (data.maxRedeemable !== undefined)
    data.maxRedeemable =
      data.maxRedeemable === null || data.maxRedeemable === ""
        ? undefined
        : Number(data.maxRedeemable);

  /**
   * Only reset discount fields when offer is disabled.
   * If offerEnabled is true, never auto-clear discountType.
   */
  if (data.offerEnabled === "false" || data.offerEnabled === false) {
    data.discount = data.discount ? Number(data.discount) : 0;
    data.discountType = undefined;
    data.minPurchaseAmount = data.minPurchaseAmount
      ? Number(data.minPurchaseAmount)
      : 0;
    data.maxRedeemable = data.maxRedeemable
      ? Number(data.maxRedeemable)
      : 0;
  }
  if (data.discountType === "") data.discountType = undefined;

  const { error, value: validatedData } = schema.validate(
    data,
    validationOptions
  );

  if (error) {
    const messages = error.details.map((el) => el.message).join(". ");
    throw createError(400, `Validation failed: ${messages}`);
  }

  return validatedData;
};
