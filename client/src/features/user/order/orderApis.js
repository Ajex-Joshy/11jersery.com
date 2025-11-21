import axiosInstance from "../../../api/axiosInstance";

export const getOrders = async (params) => {
  const { data } = await axiosInstance.get("/orders", { params });
  return data;
};
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    console.log(orderId, response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  console.log(orderData);
  try {
    const response = await axiosInstance.post("/orders/cod", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelItem = async (orderId, itemId) => {
  try {
    const response = await axiosInstance.put(
      `/orders//${orderId}/items/${itemId}/cancel`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestReturnItem = async (orderId, itemId, returnData) => {
  try {
    const response = await axiosInstance.put(
      `/orders/${orderId}/items/${itemId}/return`,
      returnData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadInvoice = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
    responseType: "blob",
  });

  return response.data; // blob
};
