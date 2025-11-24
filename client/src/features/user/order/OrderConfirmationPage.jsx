import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  ChevronRight,
  ArrowRight,
  Printer,
} from "lucide-react";
import { useOrderDetails } from "./orderHooks";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import Confetti from "react-confetti";
import InvoiceDownloadButton from "../../../components/user/Buttons";

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { order, isLoading, isError, error } = useOrderDetails(orderId);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) return <LoadingSpinner text="Loading order details..." />;
  if (isError) return <ErrorDisplay error={error} />;

  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Confetti recycle={false} numberOfPieces={300} />

      <div className="container mx-auto px-4 py-12">
        {/* --- Success Header --- */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={3} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Your order{" "}
            <span className="font-mono font-bold text-black">
              #{order.orderId}
            </span>{" "}
            has been placed successfully. We've sent a confirmation email to{" "}
            <span className="font-medium text-black">
              {/* Add user email here if available in order object */} your
              email
            </span>
            .
          </p>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Items & Tracking */}
          <div className="lg:col-span-8 space-y-8">
            {/* Status Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-wrap gap-6 justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Number</p>
                  <p className="font-mono font-bold text-gray-900">
                    {order.orderId || order._id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {order.payment?.method}
                  </p>
                </div>
                <div>
                  <InvoiceDownloadButton order={order} />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-gray-400" /> Order Items (
                  {order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="p-6 flex flex-col sm:flex-row gap-6"
                  >
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        <Link
                          to={`/product/${item.slug}`}
                          className="hover:underline"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Size: {item.size} | Qty: {item.quantity}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ₹{item?.salePrice}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Address */}
          <div className="lg:col-span-4 space-y-8">
            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{order?.price?.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="text-green-600">
                    - ₹{order?.price?.subtotal - order?.price?.discountedPrice}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>
                    {order?.price?.deliveryFee === 0
                      ? "Free"
                      : `₹${order?.price?.deliveryFee}`}
                  </span>
                </div>
                <div className="border-t border-gray-300 my-4 pt-4 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{order?.price?.total}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-gray-400" /> Shipping Address
              </h2>
              <address className="not-italic text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-900 block mb-1">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </strong>
                {order.shippingAddress.addressLine1}
                <br />
                {order.shippingAddress.addressLine2 && (
                  <>
                    {order.shippingAddress.addressLine2}
                    <br />
                  </>
                )}
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.pinCode}
                <br />
                {order.shippingAddress.country}
                <br />
                <span className="block mt-2">
                  {console.log(order.hippingAddress)}
                  Phone: {order.shippingAddress.phoneNumber}
                </span>
              </address>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                to="/account/orders"
                className="block w-full text-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="block w-full text-center bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
              >
                Continue Shopping <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
