import { asyncHandler, sendResponse } from "../../utils/helpers.js";

import { addProduct } from "../../services/admin/productServices.js";

export const createProductController = asyncHandler(async (req, res) => {
  const { product, faqs } = await addProduct(req.body);
  sendResponse(res, { product, faqs });
});
