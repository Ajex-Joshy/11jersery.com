import axiosInstance from "../../../api/axiosInstance";

export const getAddresses = async () => {
  const response = await axiosInstance.get("/address");
  return response.data;
};

export const getAddressById = async (id) => {
  const response = await axiosInstance.get(`/address/${id}`);
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await axiosInstance.post("/address", addressData);
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  console.log("Api", id, addressData);
  const response = await axiosInstance.patch(`/address/${id}`, addressData);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await axiosInstance.delete(`/address/${id}`);
  return response.data;
};
