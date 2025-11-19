import axiosInstance from "../../../api/axiosInstance";

export const getCart = async () => {
  const { data } = await axiosInstance.get("/cart");
  return data;
};

export const addItemToCart = async ({ productId, size, quantity }) => {
  const { data } = await axiosInstance.post("/cart/item", {
    productId,
    size,
    quantity,
  });
  return data;
};

export const incrementItem = async ({ itemId }) => {
  const { data } = await axiosInstance.patch(`/cart/increment/${itemId}`);
  return data;
};

export const decrementItem = async ({ itemId }) => {
  const { data } = await axiosInstance.patch(`/cart/decrement/${itemId}`);
  return data;
};

export const removeItemFromCart = async (itemId) => {
  console.log("apiItemId", itemId);
  const { data } = await axiosInstance.delete(`/cart/remove/${itemId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await axiosInstance.delete("/cart/clear");
  return data;
};
