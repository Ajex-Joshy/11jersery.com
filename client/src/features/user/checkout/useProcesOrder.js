import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  usePlaceCODOrder,
  useWalletPay,
  useRazorpayOrder,
  useRazorpayVerify,
} from "../order/orderHooks";
import { useState } from "react";
import { loadRazorpayScript } from "../../../utils/loadRazorpay";
const _loaded = await loadRazorpayScript();
import { env } from "../../../utils/env.js";
import { formatRupee } from "../../../utils/currency.js";
import { MAX_COD_AMOUNT } from "../../../utils/constants.js";

export const useProcessOrder = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutate: codMutation } = usePlaceCODOrder();
  const { mutate: walletMutation } = useWalletPay();
  const { mutate: razorpayOrderMutation } = useRazorpayOrder();
  const { mutate: razorpayVerifyMutation } = useRazorpayVerify();

  const processOrder = (method, selectedAddressId, total) => {
    if (!method) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    // COD
    if (method === "cod") {
      if (total > MAX_COD_AMOUNT) {
        toast.error(
          `Cannot process COD for order above ${formatRupee(MAX_COD_AMOUNT)}`
        );
        setIsProcessing(false);
        return null;
      }
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
            const { amount, currency, razorpayOrderId } = razorOrder.data;
            const razor = new window.Razorpay({
              key: env.VITE_RAZORPAY_KEY_ID,
              amount,
              currency,
              order_id: razorpayOrderId,
              name: "11jersey.com",
              modal: {
                ondismiss: () => {
                  setIsProcessing(false);
                  toast.error("Payment cancelled");
                  navigate("/account/orders");
                },
              },
              handler: (paymentResult) => {
                razorpayVerifyMutation(
                  {
                    razorpayOrderId: paymentResult.razorpay_order_id,
                    razorpayPaymentId: paymentResult.razorpay_payment_id,
                    razorpaySignature: paymentResult.razorpay_signature,
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
            razor.on("payment.failed", function (response) {
              setIsProcessing(false);
              toast.error(
                response.error.description || "Payment failed, please try again"
              );
              // do not navigate, only show toast on failure
            });
            razor.open();
            setIsProcessing(false);
          },
          onError: (err) => {
            setIsProcessing(false);
            toast.error("Unable to initiate Razorpay payment");
          },
        }
      );
    }
  };

  return { processOrder, isProcessing };
};
