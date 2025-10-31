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
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/admin/categoryValidator.js";
import { parseAndValidateCategoryData } from "./controllerHelpers.js/parseAndValidateCategoryData.js";

export const createCategoryController = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "Image is required" });
  }
  let validatedData;
  try {
    validatedData = parseAndValidateCategoryData(
      req.body,
      createCategorySchema
    );
  } catch (error) {
    throw error;
  }

  const imageId = await uploadFileToS3(file);

  const category = await createCategory({ ...validatedData, imageId });
  sendResponse(res, category);
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const updateData = req.body || {};
  const file = req.file;
  let validatedData;
  try {
    validatedData = parseAndValidateCategoryData(
      req.body,
      updateCategorySchema
    );
  } catch (error) {
    throw error;
  }

  let newImageId = null;
  if (file) {
    try {
      newImageId = await uploadFileToS3(file);
      updateData.imageId = newImageId;
    } catch (s3Error) {
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
