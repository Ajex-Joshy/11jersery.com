import { getLandingCategoriesWithProducts } from "./landingPageServiceHelpers.js/getCategoriesWithProducts.js";
import { getCollectionsData } from "./landingPageServiceHelpers.js/getCollectionData.js";
import { getPaginatedReviews } from "./landingPageServiceHelpers.js/getRevies.js";

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
