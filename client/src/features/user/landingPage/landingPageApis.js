import axiosInstance from "../../../api/axiosInstance";

export const getLandingPageData = async () => {
  // Use a different axios instance if authentication is not needed
  const { data } = await axiosInstance.get(`/landing-page`);
  return data; // Expects { data: { categories: [], collections: [], reviews: [] } }
};
