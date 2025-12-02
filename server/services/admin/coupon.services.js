import createError from "http-errors";
import Coupon from "../../models/coupon.model.js";
import { getPagination, getSortOption } from "../../utils/helpers.js";
import { toPaise } from "../../utils/currency.js";

export const createCoupon = async (couponData) => {
  const existingCoupon = await Coupon.findOne({ code: couponData.code });
  if (existingCoupon) {
    throw createError(409, "Coupon with this code already exists");
  }

  if (new Date(couponData.startDate) >= new Date(couponData.expiryDate)) {
    throw createError(400, "Expiry date must be after start date");
  }

  if (couponData.discountValue) {
    couponData.discountValue = toPaise(couponData.discountValue);
  }
  if (couponData.minPurchaseAmount) {
    couponData.minPurchaseAmount = toPaise(couponData.minPurchaseAmount);
  }
  if (couponData.maxDiscountAmount) {
    couponData.maxDiscountAmount = toPaise(couponData.maxDiscountAmount);
  }

  return await Coupon.create(couponData);
};

export const getAllCoupons = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status = "", // 'active', 'inactive', 'expired'
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const query = {};

  // Search by code
  if (search) {
    query.code = { $regex: search, $options: "i" };
  }

  // Status Filter
  if (status) {
    const now = new Date();
    if (status === "active") {
      query.isActive = true;
      query.expiryDate = { $gt: now };
      query.startDate = { $lte: now };
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "expired") {
      query.expiryDate = { $lt: now };
    }
  }

  const { pageNumber, pageSize, skip } = getPagination(page, limit);
  const sort = getSortOption(sortBy, sortOrder);

  const [coupons, totalCoupons] = await Promise.all([
    Coupon.find(query).sort(sort).skip(skip).limit(pageSize).lean(),
    Coupon.countDocuments(query),
  ]);

  return {
    coupons,
    pagination: {
      totalCoupons,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCoupons / pageSize),
      limit: pageSize,
    },
  };
};

export const updateCoupon = async (couponId, updateData) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw createError(404, "Coupon not found");

  // Prevent updating code to a duplicate
  if (updateData.code && updateData.code !== coupon.code) {
    const duplicate = await Coupon.findOne({ code: updateData.code });
    if (duplicate) throw createError(409, "Coupon code already exists");
  }

  if (updateData.discountValue) {
    updateData.discountValue = toPaise(updateData.discountValue);
  }

  if (updateData.maxDiscountAmount) {
    updateData.maxDiscountAmount = toPaise(updateData.maxDiscountAmount);
  }
  if (updateData.minPurchaseAmount) {
    updateData.minPurchaseAmount = toPaise(updateData.minPurchaseAmount);
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  return updatedCoupon;
};

export const deleteCoupon = async (couponId) => {
  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) throw createError(404, "Coupon not found");
  return coupon;
};
