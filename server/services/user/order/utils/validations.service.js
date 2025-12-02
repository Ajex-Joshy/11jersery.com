import { AppError } from "../../../../utils/helpers.js";
import { STATUS_CODES } from "../../../../utils/constants.js";

export const ensureOrderExists = (order) => {
  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");
};

export const ensureItemExists = (item) => {
  if (!item)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "INVALID_ITEM",
      "Item not found in order"
    );
};

export const ensureCancelable = (order) => {
  if (!["Pending", "Processing"].includes(order.orderStatus)) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STAGE",
      "Order/item cannot be cancelled at this stage"
    );
  }
};

export const ensureItemCancelable = (item) => {
  if (!item)
    throw new AppError(
      STATUS_CODES.NOT_FOUND,
      "INVALID_ITEM",
      "Item not found in order"
    );
  if (!["Pending", "Processing"].includes(item.status)) {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STAGE",
      "Order/item cannot be cancelled at this stage"
    );
  }
};

export const ensureReturnable = (item) => {
  if (item.status !== "Delivered") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STAGE",
      "This item cannot be returned"
    );
  }
};

export const ensureApproveReturnable = (item) => {
  if (item.status !== "Return Requested") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STAGE",
      "This item cannot be returned"
    );
  }
};

export const ensureReturnApproved = (item) => {
  if (item.status !== "Return Approved") {
    throw new AppError(
      STATUS_CODES.BAD_REQUEST,
      "INVALID_STAGE",
      "This item cannot be returned"
    );
  }
};
