import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search, Package, ArrowRight } from "lucide-react";
import { useOrders } from "./orderHooks";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import Pagination from "../../../components/common/Pagination";
import InvoiceDownloadButton from "../../../components/user/Buttons";
import { formatRupee } from "../../../utils/currency";

// --- Helper: Order Status Badge ---
const OrderStatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Shipped: "bg-purple-50 text-purple-700 border-purple-200",
    Delivered: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
    Returned: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
};

// --- Component: Single Order Card ---
const OrderHistoryCard = ({ order }) => {
  console.log("order", order);
  const navigate = useNavigate();

  // Get first few items for preview
  const previewItems = order.items.slice(0, 3);
  const remainingCount = order.items.length - 3;
  if (order.items.length === 0) {
    return <div>No Orders Found</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow mb-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-md">
            <Package size={20} className="text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono font-bold text-gray-900">
              {order.orderId || order._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">Placed On</p>
            <p className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Image Stack */}
        <div className="flex -space-x-3 overflow-hidden py-2">
          {previewItems.map((item) => (
            <img
              key={item._id}
              src={item.imageUrl}
              alt={item.title}
              className="inline-block h-16 w-16 rounded-full ring-2 ring-white object-cover bg-gray-100"
              onError={(e) => (e.target.src = "/placeholder.jpg")}
            />
          ))}
          {remainingCount > 0 && (
            <div className="h-16 w-16 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Summary Text */}
        {console.log(order)}
        <div className="grow">
          <h4 className="font-semibold text-gray-900 mb-1">
            {order?.items.length === 1
              ? order.items[0]?.title
              : `${order?.items[0].title} + ${order?.items?.length - 1} others`}
          </h4>
          <p className="text-sm text-gray-500">
            Total Amount:{" "}
            <span className="text-black font-bold">
              {formatRupee(order?.price?.total)}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
          {order.orderStatus === "Delivered" && (
            <InvoiceDownloadButton
              order={order}
              variant="icon"
              className="border border-gray-300 p-2 rounded-md"
            />
          )}
          <button
            onClick={() => navigate(`/account/orders/${order._id}`)}
            className="grow md:grow-0 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            View Details <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const OrderHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Handle Filters & Search
  const handleStatusChange = (status) => {
    setSearchParams((prev) => {
      if (status === "All") prev.delete("status");
      else prev.set("status", status);
      prev.set("page", "1"); // Reset page
      return prev;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const val = e.target.search.value;
    setSearchParams((prev) => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    });
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      prev.set("page", page);
      return prev;
    });
  };

  // 2. Fetch Data
  const {
    data: ordersPayload,
    isLoading,
    isError,
    error,
  } = useOrders(searchParams);

  const orders = ordersPayload?.data?.orders || [];
  const metadata = ordersPayload?.data?.metadata;
  const currentStatus = searchParams.get("status") || "All";

  if (isLoading) return <LoadingSpinner text="Loading your orders..." />;
  if (isError) return <ErrorDisplay error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            name="search"
            defaultValue={searchParams.get("search")}
            placeholder="Search Order ID or Product..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none"
          />
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          "All",
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      currentStatus === status
                        ? "bg-black text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }
                `}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="text-gray-500 mb-6">
            We couldn't find any orders matching your criteria.
          </p>
          <Link to="/" className="text-blue-600 font-semibold hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div>
          {console.log(orders)}
          {orders.map((order) => (
            <OrderHistoryCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {metadata?.pagination?.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            pagination={metadata.pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
