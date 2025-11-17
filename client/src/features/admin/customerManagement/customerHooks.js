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

    onMutate: async ({ userId, isBlocked }) => {
      await queryClient.cancelQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });

      const previousCustomers = queryClient.getQueryData([CUSTOMERS_QUERY_KEY]);

      queryClient.setQueriesData({ queryKey: [CUSTOMERS_QUERY_KEY] }, (old) => {
        if (!old || !old.data || !old.data.users) return old;

        return {
          ...old,
          data: {
            ...old.data,
            users: old.data.users.map((user) =>
              user._id === userId
                ? {
                    ...user,
                    isBlocked,
                    status: isBlocked ? "blocked" : "active",
                  }
                : user
            ),
          },
        };
      });

      return { previousCustomers };
    },

    onError: (error, variables, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData(
          [CUSTOMERS_QUERY_KEY],
          context.previousCustomers
        );
      }
    },

    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY] });
    //   queryClient.invalidateQueries({ queryKey: [CUSTOMER_STATS_QUERY_KEY] });
    // },
  });
};
