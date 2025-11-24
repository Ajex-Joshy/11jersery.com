import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ShieldCheck, Lock } from "lucide-react";
import toast from "react-hot-toast";
// Hooks
import { useCart } from "../cart/cartHooks";
import { useProcessOrder } from "./useProcesOrder";
// Components
import { OrderSummary } from "../../../components/user/OrderSummary";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import PaymentMethodOption from "./components/PaymentMethodOption";
import { paymentMethods } from "../../../utils/constants";
import { ICON_MAP } from "../../../utils/constants";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processOrder, isProcessing } = useProcessOrder();
  const selectedAddressId = location.state?.selectedAddressId;

  const { data: cartPayload, isLoading, isError, error } = useCart();

  const [selectedMethod, setSelectedMethod] = useState("wallet");

  // Loading/Error States
  if (isLoading) return <LoadingSpinner text="Loading payment options..." />;
  if (isError) return <ErrorDisplay error={error} />;

  const cart = cartPayload?.data || {};
  const items = cart.items || [];
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }
    processOrder(selectedMethod, selectedAddressId);
  };

  // Determine button text based on selected method
  const getButtonText = () => {
    if (isProcessing) return "Processing...";
    if (selectedMethod === "cod" || selectedMethod === "wallet")
      return "Place Order";
    return "Pay with Razorpay";
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm flex items-center gap-2 text-gray-500">
          <Link to="/cart" className="hover:text-black transition">
            Cart
          </Link>
          <ChevronRight size={14} />
          <Link to="/checkout" className="hover:text-black transition">
            Checkout
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-black">Payment</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Select Payment Method
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COLUMN (Payment Methods) --- */}
          <div className="lg:col-span-7 space-y-6">
            {paymentMethods.map((method) => {
              const Icon = ICON_MAP[method.icon];
              return (
                <PaymentMethodOption
                  key={method.id}
                  id={method.id}
                  title={method.title}
                  description={method.description}
                  icon={Icon}
                  selected={selectedMethod === method.id}
                  onSelect={setSelectedMethod}
                />
              );
            })}

            {/* Security Notice */}
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-800 mt-6">
              <ShieldCheck className="flex-shrink-0" size={20} />
              <p>
                Your payment information is encrypted and secure. We do not
                store your card details.
              </p>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Sidebar/Sticky) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <OrderSummary
                  isCheckoutPage={true} // Hide promo input
                />
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {getButtonText()}
                {!isProcessing && <Lock size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
