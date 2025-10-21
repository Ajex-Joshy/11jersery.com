import {
  getCollectionsData,
  getLandingCategoriesWithProducts,
} from "../common/categoryService.js";
import { getPaginatedReviews } from "../common/reviewsService.js";

export const getLandingPageData = async (queryParams) => {
  const [categories, collections, reviews] = await Promise.all([
    getLandingCategoriesWithProducts(),
    getCollectionsData(),
    getPaginatedReviews(),
  ]);

  return {
    categories,
    collections,
    reviews,
  };
};
