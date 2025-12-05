import Product from "../../../models/product.model.js";
import connectDb from "../../../config/db.js";

const formatProduct = (product) => ({
  id: product._id,
  title: product.title,
  slug: product.slug,
  description: product.description,
  price: product.price.sale,
  sizes: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
  tags: product.tags,
});

export const getProducts = async () => {
  await connectDb();
  const products = await Product.find({
    isDeleted: false,
    isListed: true,
  }).select(
    "-imageIds -categoryIds -createdAt -updatedAt -isListed -isDeleted -__v"
  );

  const formattedProducts = products.map(formatProduct);

  let finalProducts = formattedProducts
    .map((product) => {
      const sizesStr = product.sizes
        .map((s) => `${s.size} (stock: ${s.stock})`)
        .join(", ");
      const tagsStr = product.tags.join(", ");
      return `Title: ${product.title}
Description: ${product.description}
Sizes: ${sizesStr}
Price: ${product.price / 100}
Tags: ${tagsStr}`;
    })
    .join("\n\n---\n\n");

  return finalProducts;
};
