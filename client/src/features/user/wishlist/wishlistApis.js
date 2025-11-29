import axiosInstance from "../../../api/axiosInstance";

/**
 * Fetches the user's wishlist (populated with products).
 */
export const getWishlist = async () => {
  const { data } = await axiosInstance.get("/wishlist");
  return data.data;
};

/**
 * Toggles a product in the wishlist (Add/Remove).
 * @param {string} productId
 */
export const toggleWishlist = async (productId) => {
  const { data } = await axiosInstance.post("/wishlist/toggle", { productId });
  return data.data;
};
