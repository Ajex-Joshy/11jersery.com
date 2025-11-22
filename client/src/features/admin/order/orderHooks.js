import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import toast from "react-hot-toast";

export const ADMIN_ORDERS_KEY = "adminOrders";

// Fetch list + stats
export const useAdminOrders = (params) => {
  return useQuery({
    queryKey: [ADMIN_ORDERS_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/orders", { params });
      return data;
    },
    keepPreviousData: true,
  });
};

export const useAdminOrderDetails = (orderId) => {
  const queryClient = useQueryClient();

  const {
    data: orderPayload,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminOrders", orderId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    onError: (err) => {
      toast.error(
        err.response?.data?.error?.message || "Failed to fetch order details"
      );
    },
  });

  // 2. Mutations
  const { mutate: cancelOrderMutate, isLoading: isCancelling } = useMutation({
    mutationFn: async ({ userId, reason }) => {
      return axiosInstance.patch(`/admin/orders/${orderId}/cancel`, {
        userId,
        reason,
      });
    },
    onSuccess: async () => {
      toast.success("Order cancelled successfully");
      return queryClient.refetchQueries(["adminOrders", String(orderId)], {
        exact: true,
      });
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.error?.message || "Failed to cancel order"
      ),
  });

  const { mutate: cancelItemMutate, isLoading: isItemCancelling } = useMutation(
    {
      mutationFn: async ({ userId, itemId, reason }) => {
        return axiosInstance.patch(
          `/admin/orders/${orderId}/items/${itemId}/cancel`,
          { userId, reason }
        );
      },
      onSuccess: async () => {
        toast.success("Item cancelled successfully");
        console.log(["adminOrders", String(orderId)]);
        return queryClient.refetchQueries(["adminOrders", String(orderId)], {
          exact: true,
        });
      },
      onError: (err) =>
        toast.error(
          err.response?.data?.error?.message || "Failed to cancel item"
        ),
    }
  );

  const order = orderPayload?.data?.order;

  // 3. Helper Logic
  const canCancelOrder =
    order && ["Pending", "Processing"].includes(order.orderStatus);

  // Helper to check if an individual item can be cancelled/returned
  const getItemStatus = (item) => {
    // Logic depends on your backend status flow
    const isCancellable = ["Pending", "Processing"].includes(item.status);
    const isReturnable = item.status === "Delivered"; // Add return window check if needed
    return { isCancellable, isReturnable };
  };

  return {
    order,
    isLoading,
    isError,
    error,
    actions: {
      cancelOrder: (userId, reason) => cancelOrderMutate({ userId, reason }),
      cancelItem: (userId, itemId, reason) =>
        cancelItemMutate({ userId, itemId, reason }),
    },
    state: {
      isCancelling,
      isItemCancelling,
      canCancelOrder,
    },
    helpers: {
      getItemStatus,
    },
  };
};
