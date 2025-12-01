import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";

export const DASHBOARD_STATS_KEY = "dashboardStats";

const getDashboardStats = async () => {
  const { data } = await axiosInstance.get("/admin/dashboard/stats");
  return data.data; // { payload: { bestSellingProducts, bestSellingCategories, stats } }
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [DASHBOARD_STATS_KEY],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
