import axiosInstance from "../../../api/axiosInstance";

export const loginUser = async (credentials) => {
  const { data } = await axiosInstance.post(`/auth/login`, credentials);
  return data;
};

export const signupUser = async (userData) => {
  const { data } = await axiosInstance.post(`/auth/signup`, userData);
  return data;
};

export const requestPasswordReset = async (email) => {
  const { data } = await axiosInstance.post(`/auth/forgot-password`, { email });
  return data;
};

export const resetPassword = async ({ token, password }) => {
  const { data } = await axiosInstance.post(`/auth/reset-password/${token}`, {
    password,
  });
  return data;
};

export const getAccountDetails = async (userId) => {
  const { data } = await axiosInstance.get(`/account/${userId}`);
  return data;
};

export const updateUserProfile = async (formData) => {
  const { data } = await axiosInstance.patch("/account", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const changePassword = async (passwordData) => {
  const { data } = await axiosInstance.post(
    "/account/change-password",
    passwordData
  );
  return data;
};

export const logout = async () => {
  const { data } = await axiosInstance.post("/auth/logout");
  return data;
};
