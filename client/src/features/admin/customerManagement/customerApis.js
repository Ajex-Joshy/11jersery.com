import axiosInstance from "../../../api/axiosInstance";

export const getCustomers = async ({ queryKey }) => {
  const [, params] = queryKey;

  const { data } = await axiosInstance.get("/admin/users", { params });
  return data;
};

export const getCustomerStats = async () => {
  const { data } = await axiosInstance.get("/admin/users/stats");

  return data;
};

export const toggleUserBlock = async ({ userId, isBlocked }) => {
  const { data } = await axiosInstance.patch(`/admin/users/${userId}/status`, {
    isBlocked,
  });
  return data;
};
