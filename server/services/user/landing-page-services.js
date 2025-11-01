import { getLandingCategoriesWithProducts } from "./landing-page-service-helpers.js/get-categories-with-products.js";
import { getCollectionsData } from "./landing-page-service-helpers.js/get-collection-data.js";
import { getPaginatedReviews } from "./landing-page-service-helpers.js/get-reviews.js";

export const getLandingPageData = async () => {
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
