import axiosInstance from "../../../api/axiosInstance";
/**
 * Fetches the current user's profile data.
 */
export const getUserProfile = async () => {
  const { data } = await axiosInstance.get("/user/profile");
  return data; // Expects { data: { _id, firstName, lastName, ... } }
};

/**
 * Updates the user's profile (name, phone, avatar).
 * @param {FormData} formData - FormData containing changed fields and optionally a new image.
 */
export const updateUserProfile = async (formData) => {
  const { data } = await axiosInstance.patch("/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // Expects { data: { user }, token: "..." }
};

/**
 * Changes the user's password.
 * @param {object} passwordData - { currentPassword, newPassword }
 */
export const changePassword = async (passwordData) => {
  const { data } = await axiosInstance.post(
    "/user/change-password",
    passwordData
  );
  return data; // Expects { message: "Password updated" }
};
