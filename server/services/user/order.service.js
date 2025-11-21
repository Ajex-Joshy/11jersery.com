import mongoose from "mongoose";
import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import Transaction from "../../models/transaction.model.js";
import { AppError } from "../../utils/helpers.js";
import { STATUS_CODES } from "../../utils/constants.js";

// PLACE COD ORDER

export const placeCodOrder = async (userId, items, shippingAddress) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let subtotal = 0;
    let discountedPrice = 0;
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product)
        throw new AppError(
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND",
          "Product not found"
        );

      const variant = product.variants?.find((v) => v.size === item.size);
      if (!variant)
        throw new AppError(
          STATUS_CODES.NOT_FOUND,
          "NOT_FOUND",
          `Variant not found for size ${item.size}`
        );

      const variantStock = variant.stock;

      if (variantStock < item.quantity) {
        throw new AppError(
          STATUS_CODES.BAD_REQUEST,
          "INSUFFICIENT_STOCK",
          `Insufficient stock for ${product.title}`
        );
      }
      item.listPrice = product.price.list;
      item.salePrice = product.price.sale;

      subtotal += product.price.list * item.quantity;
      discountedPrice += product.price.sale * item.quantity;
      total = discountedPrice < 500 ? discountedPrice + 80 : discountedPrice;
      console.log(subtotal, discountedPrice, total);
    }

    // Deduct stock atomically
    for (const item of items) {
      await Product.updateOne(
        { _id: item.productId, "variants.size": item.size },
        { $inc: { "variants.$.stock": -item.quantity } }
      ).session(session);
    }

    //  Create order
    const order = await Order.create(
      [
        {
          userId,
          items,
          shippingAddress,
          payment: {
            method: "COD",
          },
          status: "pending",
          price: {
            subtotal,
            discountedPrice,
            couponCode: null,
            couponId: null,
            deliveryFee: total < 500 ? 80 : 0,
            total,
          },
          timeline: {
            placedAt: new Date(),
            confirmedAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            shippedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            deliveredAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//  LIST ALL ORDERS
export const listOrders = async (userId) => {
  return Order.find({ userId })
    .sort({ createdAt: -1 })
    .select("-gateway -metadata");
};

// ORDER DETAILS
export const getOrderDetails = async (userId, orderId) => {
  console.log(userId, orderId);
  const order = await Order.findOne({ _id: orderId, userId });
  console.log(order);

  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");

  return order;
};

//  DOWNLOAD INVOICE
export const getInvoiceData = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId }).lean();

  if (!order)
    throw new AppError(STATUS_CODES.NOT_FOUND, "NOT_FOUND", "Order not found");

  return order;
};

//  REQUEST ORDER CANCELLATION
export const cancelOrder = async (userId, orderId, reason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      userId,
    }).session(session);

    if (!order)
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "CANNOT_CANCEL",
        "Order cannot be cancelled"
      );
    console.log(order.orderStatus);
    if (!["Pending", "Processing"].includes(order.orderStatus)) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "INVALID_STAGE",
        "Order cannot be cancelled at this stage"
      );
    }

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId, "variants.size": item.size },
        { $inc: { "variants.$.stock": item.quantity } }
      ).session(session);
    }

    order.items = order.items.map((item) => ({
      ...item.toObject(),
      status: "Cancelled",
      cancelReason: reason,
      timeline: {
        ...item.timeline,
        cancelledAt: new Date(),
      },
    }));

    order.status = "Cancelled";

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

//  REQUEST ORDER RETURN
export const requestReturnOrder = async (userId, orderId, reason) => {
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

    order.items = order.items.map((item) => ({
      ...item.toObject(),
      status: "Return Requested",
      returnReason: reason,
      timeline: {
        ...item.timeline,
        returnRequestedAt: new Date(),
      },
    }));

    order.orderStatus = "Return Requested";

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

// CANCEL INDIVIDUAL ITEM
export const cancelSingleItem = async (userId, orderId, itemId, reason) => {
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
        "Item not found in this order"
      );

    if (!["Pending", "Processing"].includes(order.orderStatus)) {
      throw new AppError(
        STATUS_CODES.BAD_REQUEST,
        "INVALID_STAGE",
        "Item cannot be cancelled at this stage"
      );
    }

    await Product.updateOne(
      { _id: item.productId, "variants.size": item.size },
      { $inc: { "variants.$.stock": item.quantity } }
    ).session(session);

    // Update only this item
    item.status = "Cancelled";
    item.cancelReason = reason;
    item.timeline = {
      ...item.timeline,
      cancelledAt: new Date(),
    };

    // If all items are cancelled → update order status also
    const allCancelled = order.items.every((i) => i.status === "Cancelled");
    if (allCancelled) order.orderStatus = "Cancelled";

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
