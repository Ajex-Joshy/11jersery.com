import redisClient from "../../config/redis-client.js";
import { getLandingCategoriesWithProducts } from "./landing-page-service-helpers.js/get-categories-with-products.js";
import { getCollectionsData } from "./landing-page-service-helpers.js/get-collection-data.js";
import { getPaginatedReviews } from "./landing-page-service-helpers.js/get-reviews.js";

const LANDING_PAGE_CACHE_KEY = "landing_page_data";
const CACHE_TTL = 60 * 5; // 5 minutes

export const getLandingPageData = async () => {
  const cachedData = await redisClient.get(LANDING_PAGE_CACHE_KEY);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const [categories, collections, reviews] = await Promise.all([
    getLandingCategoriesWithProducts(),
    getCollectionsData(),
    getPaginatedReviews(),
  ]);
  const landingPageData = { categories, collections, reviews };

  await redisClient.set(
    LANDING_PAGE_CACHE_KEY,
    JSON.stringify(landingPageData),
    "EX",
    CACHE_TTL
  );

  return landingPageData;
};
