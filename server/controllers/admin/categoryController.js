import { asyncHandler, sendResponse } from "../../utils/helpers.js";
import {
  createCategory,
  getCategories,
  getCategoryDetails,
  softDeleteCategory,
  updateCategoryStatus,
} from "../../services/admin/categoryServices.js";
import { updateCategory } from "../../services/admin/categoryServices.js";
import { uploadFileToS3 } from "../../services/admin/s3Service.js";
import logger from "../../utils/logger.js";

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
  const file = req.file;
  if (updateData.isListed !== undefined) {
    updateData.isListed = updateData.isListed === "true";
  }
  if (updateData.isFeatured !== undefined) {
    updateData.isFeatured = updateData.isFeatured === "true";
  }
  // Convert numbers if needed
  if (updateData.categoryOffer !== undefined) {
    updateData.categoryOffer = Number(updateData.categoryOffer);
  }
  if (updateData.maxRedeemable !== undefined) {
    updateData.maxRedeemable = Number(updateData.maxRedeemable);
  }

  let newImageId = null;
  if (file) {
    try {
      newImageId = await uploadFileToS3(file);
      updateData.imageId = newImageId;
    } catch (s3Error) {
      // Handle S3 upload error specifically
      logger.error("S3 Upload Error:", s3Error);
      res.status(500);
      throw new Error("Failed to upload new category image.");
    }
  }

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

export const getCategoryBySlugController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await getCategoryDetails(slug);

  sendResponse(res, category);
});
