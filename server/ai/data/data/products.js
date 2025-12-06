import Product from "../../../models/product.model.js";
import connectDb from "../../../config/db.js";

const formatProduct = (product) => ({
  id: product._id,
  title: product.title,
  description: product.description,
  tagline: product.shortDescription,
  tags: product.tags,
});

export const getProducts = async () => {
  await connectDb();
  const products = await Product.find({
    isDeleted: false,
    isListed: true,
  }).select("title description shortDescription tags _id");

  const formattedProducts = products.map(formatProduct);

  return formattedProducts;
};

//   let finalProducts = formattedProducts
//     .map((product) => {
//       const sizesStr = product.sizes
//         .map((s) => `${s.size} (stock: ${s.stock})`)
//         .join(", ");
//       const tagsStr = product.tags.join(", ");
//       return `Title: ${product.title}
// Description: ${product.description}
// Tagline: ${product.shortDescription}
// Tags: ${tagsStr}`;
//     })
//     .join("\n\n---\n\n");
