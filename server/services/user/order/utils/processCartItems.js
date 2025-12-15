import Product from "../../../../models/product.model.js";
import { getSignedUrlForKey } from "../../../admin/service-helpers/s3.service.js";

export const processCartItems = async (cart) => {
  if (!cart || !Array.isArray(cart.items)) {
    return [];
  }

  const cartItems = cart.items;
  if (!cartItems.length) return [];

  const productIds = cartItems.map((i) => i.productId);

  // Fetch products
  const products = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
  });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const processedItems = [];

  for (const item of cartItems) {
    const product = productMap.get(item.productId.toString());
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    const imageUrl = await getSignedUrlForKey(product.imageIds?.[0]);

    processedItems.push({
      _id: item._id,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      title: product.title,
      slug: product.slug,
      categoryIds: product.categoryIds,
      listPrice: product.price.list,
      salePrice: product.price.sale,
      imageId: product.imageIds?.[0],
      imageUrl,
    });
  }

  return processedItems;
};
