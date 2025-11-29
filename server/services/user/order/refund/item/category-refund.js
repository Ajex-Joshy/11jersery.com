import Product from "../../../../../models/product.model.js";

async function buildCategoryTotals(items, products, categoryId) {
  const productById = new Map();
  products.forEach((p) => {
    productById.set(p._id.toString(), p);
  });

  let totalAmount = 0;

  for (const item of items) {
    const prod = productById.get(item.productId.toString());
    if (!prod) continue;

    const lineAmount =
      (prod.price?.sale ?? prod.price?.list ?? 0) * item.quantity;

    (prod.categoryIds || []).forEach((cId) => {
      if (cId.toString() === categoryId.toString()) {
        totalAmount += lineAmount;
      }
    });
  }

  return {
    categoryId,
    totalAmount,
  };
}

export const calculateCategoryDiscountRefund = async (order, item) => {
  const currentDiscount = order?.price?.specialDiscount ?? 0;

  const {
    categoryId,
    minPurchaseAmount,
    discountType,
    discount,
    maxRedeemable,
  } = order?.price?.appliedCategoryOffer;

  const items = order.items.filter((i) => i._id !== item._id);
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const { totalAmount } = await buildCategoryTotals(
    items,
    products,
    categoryId
  );

  let newDiscount = 0;

  if (discountType === "percent") {
    if (totalAmount >= minPurchaseAmount) {
      newDiscount = (totalAmount * discount) / 100;

      if (maxRedeemable && newDiscount > maxRedeemable) {
        newDiscount = maxRedeemable;
      }

      newDiscount = Math.min(newDiscount, currentDiscount);
    }
  }

  if (discountType === "flat") {
    if (totalAmount >= minPurchaseAmount) {
      newDiscount = currentDiscount;
    } else {
      newDiscount = 0;
    }
  }

  if (items.length === 0) {
    newDiscount = 0;
  }

  const refundAmount = Math.max(currentDiscount - newDiscount, 0);

  return {
    recalculatedSpeicialDiscount: Math.round(newDiscount),
    categoryRefundAmount: Math.round(refundAmount),
  };
};

// export const calculateCategoryDiscountRefund = async (order, item) => {
//   let reduceAmount = 0;
//   const specialDiscount = order?.price?.specialDiscount;
//   const { categoryId, minPurchaseAmount, discountType, discount, maxRedeemable } =
//     order?.price?.appliedCategoryOffer;
//   let items = order.items.filter((i) => i._id !== item._id);
//   const productIds = items.map((i) => i.productId);
//   const products = await Product.find({ _id: { $in: productIds } });

//   const { totalAmount } = await buildCategoryTotals(
//     items,
//     products,
//     categoryId
//   );
//   console.log(discountType);
//   if (discountType === "percent") {
//     console.log(specialDiscount, totalAmount, discount);
//     reduceAmount = Math.round(specialDiscount - totalAmount * (discount / 100));
//   }
//   if (discountType === "flat") {
//     if (totalAmount < minPurchaseAmount) {
//       reduceAmount = specialDiscount;
//     }
//   }

//   return reduceAmount;
// };
