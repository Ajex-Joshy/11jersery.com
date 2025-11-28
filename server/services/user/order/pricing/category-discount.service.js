import categoryModel from "../../../../models/category.model.js";

export async function buildCategoryTotals(items, products, Category) {
  const categoryIdSet = new Set();
  const productById = new Map();

  products.forEach((p) => {
    productById.set(p._id.toString(), p);
    (p.categoryIds || []).forEach((c) => categoryIdSet.add(c.toString()));
  });

  const categoryIds = Array.from(categoryIdSet);
  if (!categoryIds.length) return { categoryTotals: {}, categoriesMap: {} };

  const categories = await categoryModel
    .find({
      _id: { $in: categoryIds },
      isDeleted: false,
    })
    .select("_id name discountType discount maxRedeemable minPurchaseAmount");

  const categoriesMap = new Map();
  categories.forEach((c) => categoriesMap.set(c._id.toString(), c));

  const categoryTotals = {};
  categoryIds.forEach((id) => {
    if (categoriesMap.has(id)) {
      categoryTotals[id] = {
        category: categoriesMap.get(id),
        totalAmount: 0,
      };
    }
  });

  for (const item of items) {
    const prod = productById.get(item.productId.toString());
    if (!prod) continue;

    const lineAmount =
      (prod.price?.sale ?? prod.price?.list ?? 0) * item.quantity;

    (prod.categoryIds || []).forEach((cId) => {
      const id = cId.toString();
      if (categoryTotals[id]) categoryTotals[id].totalAmount += lineAmount;
    });
  }

  return { categoryTotals, categoriesMap };
}

export function evaluateCategoryDiscount(entry) {
  const { category, totalAmount } = entry;
  if (!category || totalAmount < (category.minPurchaseAmount ?? 0)) return 0;

  let discountAmount = 0;

  if (category.discountType === "percentage") {
    discountAmount = (totalAmount * (category.discount || 0)) / 100;
    if (category.maxRedeemable)
      discountAmount = Math.min(discountAmount, category.maxRedeemable);
  } else if (category.discountType === "flat") {
    discountAmount = category.discount || 0;
  }

  return Math.max(0, discountAmount);
}
