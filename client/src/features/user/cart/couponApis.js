import axiosInstance from "../../../api/axiosInstance";

export const applyCouponCode = async (code) => {
  const { data } = await axiosInstance.post("/coupons/coupon", { code });
  return data.data;
};

export const removeCouponCode = async () => {
  const { data } = await axiosInstance.delete("/coupons/coupon");
  return data.data;
};
