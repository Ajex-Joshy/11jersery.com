import Category from "../../../../models/category.model.js";
import Product from "../../../../models/product.model.js";
import { getSignedUrlForKey } from "../../../admin/service-helpers/s3.service.js";

export const processCartItems = async (cart) => {
  const cartItems = cart.items;
  if (!cartItems?.length) return [];

  const productIds = cartItems.map((i) => i.productId);

  // Fetch products
  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
  });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // Fetch categories
  const allCategoryIds = [
    ...new Set(
      products.flatMap((p) => p.categoryIds?.map((c) => c.toString()) || [])
    ),
  ];

  const categories = await Category.find({
    _id: { $in: allCategoryIds },
    isDeleted: false,
  });

  const categoriesMap = new Map(categories.map((c) => [c._id.toString(), c]));

  const processedItems = [];

  for (const item of cartItems) {
    const product = productMap.get(item.productId.toString());
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    const imageUrl = await getSignedUrlForKey(product.imageIds?.[0]);

    const itemCategories = (product.categoryIds || [])
      .map((c) => c.toString())
      .filter((cId) => categoriesMap.has(cId))
      .map((cId) => categoriesMap.get(cId));

    processedItems.push({
      _id: item._id,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      title: product.title,
      slug: product.slug,
      listPrice: product.price.list,
      salePrice: product.price.sale,
      imageId: product.imageIds?.[0],
      imageUrl,
      categories: itemCategories,
    });
  }

  return processedItems;
};
