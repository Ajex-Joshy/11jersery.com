import { asyncHandler } from "../../utils/helpers.js";
import { sendResponse } from "../../utils/helpers.js";
import { getProductDetailsService } from "../../services/user/productService.js";

export const getProductDetailsController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const productData = await getProductDetailsService(slug);

  sendResponse(res, productData);
});
