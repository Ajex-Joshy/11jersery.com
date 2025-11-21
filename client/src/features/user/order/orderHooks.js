import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelItem,
  cancelOrder,
  getOrderDetails,
  getOrders,
  placeOrder,
  requestReturnItem,
} from "./orderApis";
import { toast } from "react-hot-toast";
const ORDER_KEYS = {
  all: ["orders"],
  details: (orderId) => ["orders", orderId],
};

export const useOrders = (searchParams) => {
  const queryParams = Object.fromEntries(searchParams.entries());

  return useQuery({
    queryKey: ["myOrders", queryParams],
    queryFn: () => getOrders(searchParams),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 1,
  });
};

// export const useOrderDetails = (orderId) => {
//   return useQuery({
//     queryKey: ORDER_KEYS.details(orderId),
//     queryFn: () => getOrderDetails(orderId),
//     enabled: !!orderId,
//   });
// };
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ORDER_KEYS.all);
    },
  });
};

export const ORDER_DETAILS_KEY = "orderDetails";

export const useOrderDetails = (orderId) => {
  const queryClient = useQueryClient();

  // 1. Fetch Order Data
  const {
    data: orderPayload,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [ORDER_DETAILS_KEY, orderId],
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId,
  });

  // 2. Mutations
  const { mutate: cancelOrderMutate, isLoading: isCancelling } = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries([ORDER_DETAILS_KEY, orderId]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to cancel order"),
  });

  // Mutation for individual item cancellation (if supported by backend)
  const { mutate: cancelItemMutate, isLoading: isItemCancelling } = useMutation(
    {
      mutationFn: cancelItem,
      onSuccess: () => {
        toast.success("Item cancelled successfully");
        queryClient.invalidateQueries([ORDER_DETAILS_KEY, orderId]);
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Failed to cancel item"),
    }
  );

  const order = orderPayload?.data;

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
      cancelOrder: () => cancelOrderMutate(orderId),
      cancelItem: (itemId) => cancelItemMutate({ orderId, itemId }),
      // returnItem: ...
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

// export const useCancelOrder = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: cancelOrder,
//     onSuccess: (_, orderId) => {
//       queryClient.invalidateQueries(ORDER_KEYS.all);
//       queryClient.invalidateQueries(ORDER_KEYS.details(orderId));
//     },
//   });
// };

// export const useCancelItem = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: cancelItem,
//     onSuccess: (_, { orderId }) => {
//       queryClient.invalidateQueries(ORDER_KEYS.details(orderId));
//       queryClient.invalidateQueries(ORDER_KEYS.all);
//     },
//   });
// };

// export const useRequestReturnItem = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: requestReturnItem,
//     onSuccess: (_, { orderId }) => {
//       queryClient.invalidateQueries(ORDER_KEYS.details(orderId));
//       queryClient.invalidateQueries(ORDER_KEYS.all);
//     },
//   });
// };

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (orderId) => {
      const data = await downloadInvoice(orderId);

      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);

      return true;
    },
  });
};
