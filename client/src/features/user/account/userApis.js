import axiosInstance from "../../../api/axiosInstance";

export const getUserProfile = async () => {
  const { data } = await axiosInstance.get("/user/profile");
  return data;
};

export const updatePersonalDetails = async (payload) => {
  const { data } = await axiosInstance.put("/user/update-details", payload);
  return data;
};

export const updatePassword = async (payload) => {
  const { data } = await axiosInstance.put("/user/update-password", payload);
  return data;
};

export const requestEmailOtp = async (newEmail) => {
  const { data } = await axiosInstance.post("/user/request-email-otp", {
    newEmail,
  });
  return data;
};

export const verifyEmailOtp = async (otp) => {
  const { data } = await axiosInstance.post("/user/verify-email-otp", { otp });
  return data;
};
