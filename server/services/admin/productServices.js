import Product from "../../models/productModel.js";
import Faq from "../../models/faqModel.js";
import { AppError, createSlug } from "../../utils/helpers.js";

export async function addProduct(productData) {
  const productInfo = productData.product;
  const faqs = productData.faqs;
  productInfo.slug = createSlug(productInfo.title);

  const existingProduct = await Product.findOne({ slug: productInfo.slug });
  if (existingProduct) {
    throw new AppError(
      429,
      "SLUG_ALREADY_EXISTS",
      "Product with this slug already exists"
    );
  }

  const savedProduct = await Product.create(productInfo);

  let savedFaqs = [];
  if (faqs && faqs.length > 0) {
    const faqsWithProductId = faqs.map((faq) => ({
      ...faq,
      productId: savedProduct._id,
    }));
    savedFaqs = await Faq.insertMany(faqsWithProductId);
  }
  console.log(savedProduct);

  return { product: savedProduct, faqs: savedFaqs };
}
