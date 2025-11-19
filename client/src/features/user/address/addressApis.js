import axiosInstance from "../../../api/axiosInstance";

export const getAddresses = async () => {
  try {
    const response = await axiosInstance.get("/address");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAddressById = async (id) => {
  try {
    const response = await axiosInstance.get(`/address/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await axiosInstance.post("/address", addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAddress = async (id, addressData) => {
  console.log("Api", id, addressData);
  try {
    const response = await axiosInstance.patch(`/address/${id}`, addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAddress = async (id) => {
  try {
    const response = await axiosInstance.delete(`/address/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
