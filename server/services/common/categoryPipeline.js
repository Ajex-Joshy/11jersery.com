import { getPagination } from "../../utils/helpers.js";
import {
  buildPaginationAddFields,
  buildProductLookupPipeline,
} from "./categoryPipelineHelpers.js";

export const buildCategoryMatch = ({ categoryId, inHome, search = "" }) => {
  const match = { isDeleted: false, isListed: true };

  if (categoryId) match._id = categoryId; // For category page
  if (inHome) match.inHome = true; // For landing page
  if (search) match.title = { $regex: search, $options: "i" };

  return match;
};

export const buildCategoryProjectFields = (fieldsArray) => {
  return {
    $project: fieldsArray.reduce((acc, field) => {
      acc[field] = 1;
      return acc;
    }, {}),
  };
};

export const buildCategoryProductPipeline = (params) => {
  const categoryMatch = buildCategoryMatch(params);
  const productLookupPipeline = buildProductLookupPipeline(params);
  const { pageNumber, pageSize } = getPagination(
    params.page || 1,
    params.limit || 10
  );

  return [
    { $match: categoryMatch },
    ...productLookupPipeline,
    buildPaginationAddFields(pageNumber, pageSize),
    buildCategoryProjectFields(["title", "products", "pagination"]),
  ];
};
