import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  usePlaceCODOrder,
  useWalletPay,
  useRazorpayOrder,
  useRazorpayVerify,
} from "../order/orderHooks";
import { useState } from "react";

export const useProcessOrder = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: codMutation } = usePlaceCODOrder();
  const { mutate: walletMutation } = useWalletPay();
  const { mutate: razorpayOrderMutation } = useRazorpayOrder();
  const { mutate: razorpayVerifyMutation } = useRazorpayVerify();

  const processOrder = (method, selectedAddressId) => {
    if (!method) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    // COD
    if (method === "cod") {
      return codMutation(
        { shippingAddressId: selectedAddressId },
        {
          onSuccess: (data) => {
            setIsProcessing(false);
            toast.success("Order placed successfully!");
            navigate(`/order-confirmation/${data?.data?._id}`);
          },
          onError: (err) => {
            setIsProcessing(false);
            toast.error(
              err?.response?.data?.error?.message || "COD payment failed"
            );
          },
        }
      );
    }

    // Wallet
    if (method === "wallet") {
      return walletMutation(
        { shippingAddressId: selectedAddressId },
        {
          onSuccess: (data) => {
            setIsProcessing(false);
            toast.success("Wallet payment successful!");
            navigate(`/order-confirmation/${data?.data?._id}`);
          },
          onError: (err) => {
            setIsProcessing(false);
            toast.error(
              err?.response?.data?.error?.message || "Wallet payment failed"
            );
          },
        }
      );
    }

    // Razorpay
    if (method === "online") {
      return razorpayOrderMutation(
        { shippingAddressId: selectedAddressId },
        {
          onSuccess: (razorOrder) => {
            const razor = new window.Razorpay({
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              amount: razorOrder.amount,
              currency: razorOrder.currency,
              order_id: razorOrder.id,
              name: "11jersey.com",
              handler: (paymentResult) => {
                razorpayVerifyMutation(
                  {
                    razorOrderId: razorOrder.id,
                    razorPaymentId: paymentResult.razorpay_payment_id,
                    razorSignature: paymentResult.razorpay_signature,
                    shippingAddressId: selectedAddressId,
                  },
                  {
                    onSuccess: (finalOrder) => {
                      toast.success("Payment successful!");
                      navigate(`/order-confirmation/${finalOrder?.data?._id}`);
                    },
                    onError: () => toast.error("Payment verification failed"),
                  }
                );
              },
            });
            razor.open();
            setIsProcessing(false);
          },
          onError: () => {
            setIsProcessing(false);
            toast.error("Unable to initiate Razorpay payment");
          },
        }
      );
    }
  };

  return { processOrder, isProcessing };
};
