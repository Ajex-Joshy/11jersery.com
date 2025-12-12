import axiosInstance from "../../../api/axiosInstance";

export const getProductDetailsBySlug = async (slug) => {
  const { data } = await axiosInstance.get(`/product/${slug}`);
  return data;
};

export const getProductFaqsBySlug = async (slug) => {
  const { data } = await axiosInstance.get(`/product/faqs/${slug}`);
  return data;
};

export const getProductsListing = async (params) => {
  const { data } = await axiosInstance.get("/products", { params });
  return data;
};
