import axiosInstance from "../../../api/axiosInstance";
/**
 * Fetch coupons with pagination and filters
 */
export const getCoupons = async (params) => {
  const { data } = await axiosInstance.get("/admin/coupons", { params });
  return data; // Expects { payload: { coupons: [], pagination: {} } }
};

/**
 * Create a new coupon
 */
export const createCoupon = async (couponData) => {
  const { data } = await axiosInstance.post("/admin/coupons", couponData);
  return data;
};

/**
 * Update an existing coupon
 */
export const updateCoupon = async ({ couponId, data }) => {
  const { data: response } = await axiosInstance.patch(
    `/admin/coupons/${couponId}`,
    data
  );
  return response;
};

/**
 * Delete a coupon
 */
export const deleteCoupon = async (couponId) => {
  const { data } = await axiosInstance.delete(`/admin/coupons/${couponId}`);
  return data;
};
