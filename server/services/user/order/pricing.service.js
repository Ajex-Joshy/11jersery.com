import Product from "../../../models/product.model.js";
import { getSignedUrlForKey } from "../../admin/service-helpers/s3.service.js";
import { validateStock } from "./stock.service.js";
import { MAX_QUANTITY_PER_ORDER } from "../../../utils/constants.js";

export const calculateOrderPrice = async (items) => {
  for (const item of items) {
    if (item.quantity > MAX_QUANTITY_PER_ORDER) {
      throw new Error(`Maximum quantity per item is ${MAX_QUANTITY_PER_ORDER}`);
    }
    await validateStock(item.productId, item.size, item.quantity);
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  const productMap = new Map();
  products.forEach((p) => productMap.set(p._id.toString(), p));

  let subtotal = 0;
  let discountedPrice = 0;
  const updatedItems = [];

  for (const item of items) {
    const product = productMap.get(item.productId.toString());

    if (!product) throw new Error(`Product not found: ${item.productId}`);
    const imageUrl = await getSignedUrlForKey(product.imageIds[0]);

    // Create a clean item object for the order
    const processedItem = {
      _id: item._id,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      listPrice: product.price.list,
      salePrice: product.price.sale,
      title: product.title,
      slug: product.slug,
      imageId: product.imageIds[0],
      imageUrl: imageUrl,
    };

    subtotal += product.price.list * item.quantity;
    discountedPrice += product.price.sale * item.quantity;
    updatedItems.push(processedItem);
  }

  const deliveryFee = discountedPrice < 500 ? 80 : 0;
  const total = discountedPrice + deliveryFee;

  return { items: updatedItems, subtotal, discountedPrice, deliveryFee, total };
};
