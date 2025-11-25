import axiosInstance from "../../../api/axiosInstance";

export const getOrders = async (params) => {
  const { data } = await axiosInstance.get("/orders", { params });
  return data;
};
export const getOrderDetails = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  console.log(orderId, response.data);
  return response.data;
};

export const placeCODOrder = async (orderData) => {
  console.log(orderData);
  const response = await axiosInstance.post("/orders/cod", orderData);
  return response.data;
};

export const placeWalletOrder = async (orderData) => {
  console.log(orderData);
  const response = await axiosInstance.post("/orders/wallet", orderData);
  return response.data;
};

export const cancelOrder = async ({ orderId, reason }) => {
  console.log(orderId, reason);
  const response = await axiosInstance.post(`/orders/${orderId}/cancel`, {
    reason,
  });
  return response.data;
};

export const cancelItem = async ({ orderId, itemId, reason }) => {
  console.log(orderId, itemId);
  const response = await axiosInstance.post(
    `/orders/${orderId}/items/${itemId}/cancel`,
    { reason }
  );
  return response.data;
};

export const requestReturnItem = async (orderId, itemId, returnData) => {
  const response = await axiosInstance.post(
    `/orders/${orderId}/items/${itemId}/return`,
    returnData
  );
  return response.data;
};

export const downloadInvoice = async (orderId) => {
  const response = await axiosInstance.get(`/orders/${orderId}/invoice`, {
    responseType: "blob",
  });

  return response.data; // blob
};

export const returnOrder = async ({ orderId, reason }) => {
  const { data } = await axiosInstance.post(`/orders/${orderId}/return`, {
    reason,
  });
  return data;
};

export const returnOrderItem = async ({ orderId, itemId, reason }) => {
  const { data } = await axiosInstance.post(
    `/orders/${orderId}/items/${itemId}/return`,
    { reason }
  );
  return data;
};
