import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  createCategory,
  getCategories,
  softDeleteCategory,
  updateCategoryStatus,
} from "../../services/admin/categoryServices.js";
import { updateCategory } from "../../services/admin/categoryServices.js";
import { uploadFileToS3 } from "../../services/admin/s3Service.js";

export const createCategoryController = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "Image is required" });
  }
  const categoryData = req.body;

  const imageId = await uploadFileToS3(file);

  const category = await createCategory({ ...categoryData, imageId });
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
