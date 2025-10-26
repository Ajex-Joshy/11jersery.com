import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerStats,
  toggleUserBlock,
} from "./customerApis.js";

export const CUSTOMERS_QUERY_KEY = "customers";
export const CUSTOMER_STATS_QUERY_KEY = "customerStats";

export const useCustomers = (params) => {
  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, params],
    queryFn: getCustomers,
    keepPreviousData: true,
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: [CUSTOMER_STATS_QUERY_KEY],
    queryFn: getCustomerStats,
    staleTime: 1000 * 60,
  });
};

export const useToggleUserBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserBlock,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [CUSTOMER_STATS_QUERY_KEY] }),
      ]);
    },
  });
};
