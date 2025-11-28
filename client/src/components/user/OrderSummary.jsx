import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Tag, Loader2, X } from "lucide-react";
import { useCart } from "../../features/user/cart/cartHooks";
import { LoadingSpinner, ErrorDisplay } from "../common/StateDisplays";
import {
  useApplyCoupon,
  useRemoveCoupon,
} from "../../features/user/cart/couponHooks";

/**
 * Reusable component for showing order totals.
 * Used in CartPage and CheckoutPage.
 */
export const OrderSummary = ({ isCheckoutPage }) => {
  const [couponInput, setCouponInput] = useState("");
  const { mutate: applyCoupon, isLoading: isApplying } = useApplyCoupon();
  const { mutate: removeCoupon, isLoading: isRemoving } = useRemoveCoupon();

  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const onCheckout = () => {
    setIsProcessing(true);
    navigate("/checkout");
  };

  const handleApply = () => {
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
    setCouponInput("");
  };
  const {
    data: cartPayload,
    isLoading: isCartLoading,
    isError,
    error,
  } = useCart();

  const cart = cartPayload.data;
  console.log("cart", cart);

  const {
    subtotal,
    total,
    deliveryFee,
    discount,
    specialDiscount,
    couponDiscount,
    referralBonus,
  } = cart || {};

  if (isCartLoading) return <LoadingSpinner text="Loading checkout..." />;
  if (isError) return <ErrorDisplay error={error} />;
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
      <h2 className="text-xl font-semibold mb-6 border-b pb-4">
        Order Summary
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">
            ₹{subtotal.toLocaleString()}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Discount</span>
            <span className="font-medium text-green-600">
              - ₹{discount.toLocaleString()}
            </span>
          </div>
        )}

        {specialDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Special Discount</span>
            <span className="font-medium text-green-600">
              - ₹{specialDiscount.toLocaleString()}
            </span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Coupon Discount</span>
            <span className="font-medium text-green-600">
              - ₹{couponDiscount.toLocaleString()}
            </span>
          </div>
        )}
        {referralBonus > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Referral Bonus</span>
            <span className="font-medium text-green-600">
              - ₹{referralBonus.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium text-gray-900">
            {typeof deliveryFee === "number"
              ? `₹${deliveryFee.toLocaleString()}`
              : deliveryFee}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {console.log("total", total)}₹{total.toLocaleString()}
          </span>
        </div>
      </div>

      {!isCheckoutPage && (
        <>
          {/* Promo Code Form */}
          <div className="py-4 border-y border-gray-200 my-4">
            {cart.couponCode ? (
              <div className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-200 text-sm">
                <span className="text-green-700 font-medium flex items-center gap-2">
                  <Tag size={14} /> {cart.couponCode} applied
                </span>
                <button
                  onClick={() => removeCoupon()}
                  disabled={isRemoving}
                  className="text-gray-400 hover:text-red-500"
                >
                  {isRemoving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <X size={14} />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter Coupon Code"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
                <button
                  onClick={handleApply}
                  disabled={isApplying || !couponInput}
                  className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isApplying ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={isProcessing}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition mt-6"
          >
            {isProcessing ? "Processing..." : "Checkout"}
            <ArrowRight size={18} />
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By continuing, I confirm that I have read and accept the
            <Link
              to="/terms-and-conditions"
              className="underline hover:text-black"
            >
              {" "}
              Terms and Conditions{" "}
            </Link>
            and
            <Link to="/privacy-policy" className="underline hover:text-black">
              {" "}
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
};

OrderSummary.propTypes = {
  isCheckoutPage: PropTypes.bool,
};
