import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

// Hooks
import { useCart } from "../cart/cartHooks";

// Components
import { OrderSummary } from "../../../components/user/OrderSummary";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";

const PaymentMethodOption = ({
  id,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}) => (
  <div
    onClick={() => onSelect(id)}
    className={`
      relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
      ${
        selected
          ? "border-black bg-gray-50 ring-1 ring-black"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }
    `}
  >
    <div
      className={`p-3 rounded-full ${
        selected ? "bg-black text-white" : "bg-gray-100 text-gray-500"
      }`}
    >
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <h3 className={`font-bold ${selected ? "text-black" : "text-gray-900"}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? "border-black" : "border-gray-300"
      }`}
    >
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
    </div>
  </div>
);

const PaymentPage = () => {
  const navigate = useNavigate();
  const { data: cartPayload, isLoading, isError, error } = useCart();

  const [selectedMethod, setSelectedMethod] = useState("cod"); // Default to COD
  const [isProcessing, setIsProcessing] = useState(false);

  // Loading/Error States
  if (isLoading) return <LoadingSpinner text="Loading payment options..." />;
  if (isError) return <ErrorDisplay error={error} />;

  const cart = cartPayload?.data || {};
  const items = cart.items || [];

  if (items.length === 0) {
    navigate("/cart"); // Redirect if empty
    return null;
  }

  const handlePlaceOrder = () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    // Simulate API call based on method
    if (selectedMethod === "cod") {
      // --- COD Flow ---
      setTimeout(() => {
        setIsProcessing(false);
        toast.success("Order placed successfully! (Cash on Delivery)");
        navigate("/account/orders");
      }, 1500);
    } else {
      // --- Razorpay Flow (Card or UPI) ---
      // Ideally, you would call your backend here to create a Razorpay order
      // and then open the Razorpay checkout modal.
      setTimeout(() => {
        setIsProcessing(false);
        toast.success(
          `Opening Razorpay for ${
            selectedMethod === "card" ? "Card" : "UPI"
          } payment...`
        );
        // Trigger Razorpay logic here
        // Example: openRazorpay(orderData);
      }, 1000);
    }
  };

  // Determine button text based on selected method
  const getButtonText = () => {
    if (isProcessing) return "Processing...";
    if (selectedMethod === "cod") return "Place Order";
    return "Pay with Razorpay"; // For Card and UPI
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
            <PaymentMethodOption
              id="card"
              title="Credit / Debit Card"
              description="Pay securely with Visa, Mastercard, or Rupay via Razorpay"
              icon={CreditCard}
              selected={selectedMethod === "card"}
              onSelect={setSelectedMethod}
            />

            <PaymentMethodOption
              id="upi"
              title="UPI"
              description="Google Pay, PhonePe, Paytm, BHIM via Razorpay"
              icon={Wallet} // Reusing wallet icon for UPI generic
              selected={selectedMethod === "upi"}
              onSelect={setSelectedMethod}
            />

            <PaymentMethodOption
              id="cod"
              title="Cash on Delivery (COD)"
              description="Pay with cash upon delivery"
              icon={Banknote}
              selected={selectedMethod === "cod"}
              onSelect={setSelectedMethod}
            />

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
              {/* Price Summary & Action */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <OrderSummary
                  subtotal={cart.subtotal}
                  total={cart.total}
                  discount={cart.discount}
                  deliveryFee="Free"
                  isCheckoutPage={true} // Hide promo input
                  onCheckout={handlePlaceOrder} // This button now places the order
                  isProcessing={isProcessing}

                  // You might need to update OrderSummary to accept custom button text if it doesn't already
                  // If OrderSummary hardcodes "Checkout" or "Place Order", you'll need to update it
                  // to accept a prop like `checkoutButtonText`.
                  // Assuming OrderSummary accepts children or a text prop, otherwise modify OrderSummary.
                />

                {/* Since OrderSummary likely has a hardcoded button, we can OVERRIDE it by 
                   passing a custom button if OrderSummary supports it, OR (easier here)
                   we can just render the button *outside* OrderSummary if OrderSummary is flexible,
                   BUT since OrderSummary encapsulates the button, we should modify OrderSummary
                   to accept the button text.
                */}
              </div>

              {/* ALTERNATE APPROACH if OrderSummary is rigid:
                  Use the OrderSummary only for display (pass a prop to hide its button)
                  and render the custom button here.
               */}
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
