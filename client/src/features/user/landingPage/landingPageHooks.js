import { useQuery } from "@tanstack/react-query";
import { getLandingPageData } from "./landingPageApis.js";

export const LANDING_PAGE_QUERY_KEY = "landingPageData";

/**
 * Hook to fetch all data required for the landing page.
 */
export const useLandingPageData = () => {
  return useQuery({
    queryKey: [LANDING_PAGE_QUERY_KEY],
    queryFn: getLandingPageData,
    staleTime: 1000 * 60 * 15, // Cache data for 15 minutes
  });
};
