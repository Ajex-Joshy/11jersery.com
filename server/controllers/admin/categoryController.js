import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import { createCategory } from "../../services/admin/categoryServices.js";

export const createCategoryController = asyncHandler(async (req, res, next) => {
  const categoryData = req.body;

  const category = await createCategory(categoryData);
  sendResponse(res, category);
});
