import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  createCategory,
  getCategories,
  softDeleteCategory,
  updateCategoryStatus,
} from "../../services/admin/categoryServices.js";
import { updateCategory } from "../../services/admin/categoryServices.js";

export const createCategoryController = asyncHandler(async (req, res) => {
  const categoryData = req.body;

  const category = await createCategory(categoryData);
  sendResponse(res, category);
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const updateData = req.body || {};

  const updatedCategory = await updateCategory(categoryId, updateData);
  sendResponse(res, updatedCategory);
});

export const deleteCategoryController = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const updatedCategory = await softDeleteCategory(categoryId);
  sendResponse(res, updatedCategory);
});

export const updateCategoryStatusController = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { isListed } = req.body || "";

  const updatedCategory = await updateCategoryStatus(categoryId, isListed);
  sendResponse(res, updatedCategory);
});

export const getCategoriescontroller = asyncHandler(async (req, res) => {
  const result = await getCategories(req.query);
  sendResponse(res, result);
});
