import mongoose from "mongoose";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import { AppError } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";

// PLACE COD ORDER

//  REQUEST ORDER RETURN

// REQUEST RETURN FOR INDIVIDUAL ITEM
export const returnSingleItem = async (userId, orderId, itemId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      userId,
      orderStatus: "Delivered",
    }).session(session);

    if (!order)
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "CANNOT_RETURN",
        "Return request not allowed"
      );

    const item = order.items.id(itemId);
    if (!item)
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "INVALID_ITEM",
        "Item not found in this order"
      );

    if (item.status !== "Delivered") {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "INVALID_STAGE",
        "This item cannot be returned"
      );
    }

    // Update only this item
    item.status = "Return Requested";
    item.returnReason = reason;
    item.timeline = {
      ...item.timeline,
      returnRequestedAt: new Date(),
    };

    // If all items are return requested → update whole order
    const allReturnRequested = order.items.every(
      (i) => i.status === "Return Requested"
    );

    if (allReturnRequested) order.orderStatus = "Return Requested";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// SUBMIT PRODUCT REVIEW (atomic write)
export const submitReview = async (
  userId,
  orderId,
  itemId,
  rating,
  place,
  comment
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, userId }).session(
      session
    );
    if (!order)
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "NOT_FOUND",
        "Order not found"
      );

    const item = order.items.id(itemId);
    if (!item)
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "INVALID_ITEM",
        "Invalid item"
      );

    // Save review
    const product = await Product.findById(item.productId).session(session);
    if (!product)
      throw new AppError(
        STATUS_CODES.NOT_FOUND,
        "NOT_FOUND",
        "Product not found"
      );

    product.reviews.push({
      userId,
      rating,
      place,
      comment,
      createdAt: new Date(),
    });

    await product.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { message: "Review submitted" };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
