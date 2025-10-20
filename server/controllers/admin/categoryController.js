import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import { createCategory } from "../../services/admin/categoryServices.js";
import { updateCategory } from "../../services/admin/categoryServices.js";

export const createCategoryController = asyncHandler(async (req, res) => {
  const categoryData = req.body;

  const category = await createCategory(categoryData);
  sendResponse(res, category);
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const updateData = req.body;

  const updatedCategory = await updateCategory(categoryId, updateData);
  sendResponse(res, updatedCategory);
});
