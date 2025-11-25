import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelItem,
  cancelOrder,
  downloadInvoice,
  getOrderDetails,
  getOrders,
  placeCODOrder,
  placeWalletOrder,
  returnOrder,
  returnOrderItem,
} from "./orderApis";
import { toast } from "react-hot-toast";
const ORDER_KEYS = {
  all: ["orders"],
  details: (orderId) => ["orders", orderId],
};
export const ORDER_DETAILS_KEY = "orderDetails";

const checkReturnEligibility = (status, deliveredAt) => {
  if (status !== "Delivered" || !deliveredAt) return false;

  const deliveryDate = new Date(deliveredAt);
  const currentDate = new Date();

  // Add 7 days to delivery date
  const returnDeadline = new Date(deliveryDate);
  returnDeadline.setDate(returnDeadline.getDate() + 7);

  return currentDate <= returnDeadline;
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

export const usePlaceCODOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeCODOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ORDER_KEYS.all);
    },
  });
};
export const useWalletPay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeWalletOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ORDER_KEYS.all);
    },
  });
};
export const useRazorpayOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeCODOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ORDER_KEYS.all);
    },
  });
};
export const useRazorpayVerify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeCODOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ORDER_KEYS.all);
    },
  });
};
export const useOrderDetails = (orderId) => {
  const queryClient = useQueryClient();

  // 1. Fetch
  const {
    data: orderPayload,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [ORDER_DETAILS_KEY, orderId],
    queryFn: () => getOrderDetails(orderId),
    enabled: !!orderId,
    onError: (err) => {
      toast.error(
        err?.response?.data?.error?.message || "Failed to fetch order details"
      );
    },
  });

  // 2. Cancellation Mutations (Existing)
  const { mutate: cancelOrderMutate, isLoading: isCancelling } = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries([ORDER_DETAILS_KEY, orderId]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to cancel order"),
  });

  const { mutate: cancelItemMutate, isLoading: isItemCancelling } = useMutation(
    {
      mutationFn: cancelItem,
      onSuccess: () => {
        toast.success("Item cancelled successfully");
        queryClient.invalidateQueries([ORDER_DETAILS_KEY, orderId]);
      },
      onError: (err) =>
        toast.error(
          err.response?.data?.error?.message || "Failed to cancel item"
        ),
    }
  );

  const { mutate: returnOrderMutate, isLoading: isReturning } = useMutation({
    mutationFn: returnOrder,
    onSuccess: () => {
      toast.success("Return requested successfully");
      queryClient.invalidateQueries([ORDER_DETAILS_KEY, orderId]);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.error?.message || "Failed to request return"
      ),
  });

  const { mutate: returnItemMutate, isLoading: isItemReturning } = useMutation({
    mutationFn: returnOrderItem,
    onSuccess: () => {
      toast.success("Item return requested successfully");
      queryClient.invalidateQueries([ORDER_DETAILS_KEY, orderId]);
    },
    onError: (err) =>
      toast.error(
        err.response?.data?.error?.message || "Failed to request item return"
      ),
  });

  const order = orderPayload?.data;

  const canCancelOrder =
    order && ["Pending", "Processing"].includes(order.orderStatus);

  // Check if whole order is eligible for return
  const canReturnOrder =
    order &&
    checkReturnEligibility(order.orderStatus, order.timeline?.deliveredAt);

  // Helper for individual items
  const getItemStatus = (item) => {
    const isCancellable = ["Pending", "Processing"].includes(item.status);
    // Item is returnable if it's delivered AND the order return window is open AND it hasn't been returned yet
    const isReturnable =
      item.status === "Delivered" &&
      checkReturnEligibility("Delivered", order?.timeline?.deliveredAt);

    return { isCancellable, isReturnable };
  };

  return {
    order,
    isLoading,
    isError,
    error,
    actions: {
      cancelOrder: (reason) => cancelOrderMutate({ orderId, reason }),
      cancelItem: (itemId, reason) =>
        cancelItemMutate({ orderId, itemId, reason }),
      returnOrder: (reason) => returnOrderMutate({ orderId, reason }),
      returnItem: (itemId, reason) =>
        returnItemMutate({ orderId, itemId, reason }),
    },
    state: {
      isCancelling,
      isItemCancelling,
      isReturning, // New
      isItemReturning, // New
      canCancelOrder,
      canReturnOrder, // New
    },
    helpers: {
      getItemStatus,
    },
  };
};

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (order) => {
      const data = await downloadInvoice(order._id);

      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.orderId}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);

      return true;
    },
  });
};
