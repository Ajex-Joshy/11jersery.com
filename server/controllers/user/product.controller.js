import { asyncHandler } from "../../utils/helpers.js";
import { sendResponse } from "../../utils/helpers.js";
import {
  getProductDetailsService,
  getProductFaqs,
  getProducts,
} from "../../services/user/product.services.js";

export const getProductDetailsController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const productData = await getProductDetailsService(slug);

  sendResponse(res, productData);
});

export const getProductFaqsController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const faqs = await getProductFaqs(slug);

  sendResponse(res, faqs);
});

export const getProductsController = asyncHandler(async (req, res) => {
  const result = await getProducts(req.query);
  sendResponse(res, result);
});
