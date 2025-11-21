import axiosInstance from "../../../api/axiosInstance";

export const getUserProfile = async () => {
  const { data } = await axiosInstance.get("/user/profile");
  return data;
};

export const updatePersonalDetails = async (payload) => {
  const { data } = await axiosInstance.patch(
    "/account/update-details",
    payload
  );
  return data;
};

export const updatePassword = async (payload) => {
  const { data } = await axiosInstance.patch(
    "/account/update-password",
    payload
  );
  return data;
};

export const requestEmailOtp = async ({ newEmail }) => {
  const { data } = await axiosInstance.post("/account/request-email-otp", {
    newEmail,
  });
  return data;
};

export const verifyEmailOtp = async (otp) => {
  const { data } = await axiosInstance.post("/account/verify-email-otp", {
    otp,
  });
  return data;
};
