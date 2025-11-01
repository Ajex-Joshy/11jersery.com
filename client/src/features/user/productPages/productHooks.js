import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getProductDetailsBySlug,
  getProductFaqsBySlug,
  getProductsListing,
} from "./productApis.js";

export const PRODUCT_DETAILS_KEY = "productDetails";
export const PRODUCT_FAQS_KEY = "productFaqs";
export const PRODUCTS_LISTING_KEY = "productsListing";

export const useProductPageData = (slug) => {
  const results = useQueries({
    queries: [
      {
        queryKey: [PRODUCT_DETAILS_KEY, slug],
        queryFn: () => getProductDetailsBySlug(slug),
        enabled: !!slug, // Only run if slug is present
        staleTime: 1000 * 60 * 5, // Cache product data for 5 minutes
      },
      {
        queryKey: [PRODUCT_FAQS_KEY, slug],
        queryFn: () => getProductFaqsBySlug(slug),
        enabled: !!slug,
        staleTime: 1000 * 60 * 60, // Cache FAQs for 1 hour
      },
    ],
  });

  const isLoading = results.some((query) => query.isLoading);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.isError)?.error;

  // Consolidate data into a clean object
  const data = {
    detailsData: results[0].data?.data, // { product, reviews, otherProducts }
    faqsData: results[1].data?.data, // { faqs }
  };

  return { data, isLoading, isError, error };
};

export const useProductsListing = (params) => {
  // Convert URLSearchParams to a plain object to use as a stable query key
  const queryParams = Object.fromEntries(params.entries());

  return useQuery({
    queryKey: [PRODUCTS_LISTING_KEY, queryParams],

    queryFn: () => getProductsListing(params),

    keepPreviousData: true, // Prevents flickering during pagination
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
