import React from "react";
import { BarChart3 } from "lucide-react";
import { useSalesReport, downloadReport } from "./reportHooks";
import ReportStatsGrid from "./components/ReportStatsGrid";
import ReportFilters from "./components/ReportFilters";
import DynamicTable from "../../../components/admin/DynamicTable";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { formatRupee } from "../../../utils/currency";

const SalesReportPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlParams = Object.fromEntries(searchParams.entries());
  // Construct queryParams with defaults + url overrides
  const queryParams = {
    page: Number(urlParams.page) || 1,
    limit: Number(urlParams.limit) || 10,
    period: urlParams.period || "daily",
    startDate: urlParams.startDate || "",
    endDate: urlParams.endDate || "",
  };

  // Ensure default period if not in URL
  if (!queryParams.period) queryParams.period = "daily";

  // 2. Fetch Data
  const {
    data: reportPayload,
    isLoading,
    isError,
    error,
  } = useSalesReport(queryParams);
  console.log("reportPayload", reportPayload);

  const reportData = reportPayload?.payload?.report || [];
  const summary = reportPayload?.payload?.summary;
  const pagination = reportPayload?.payload?.pagination;
  console.log(queryParams);

  // 3. Handlers
  const onCustomFilterChange = (newValues) => {
    setSearchParams((prev) => {
      Object.entries(newValues).forEach(([key, value]) => {
        if (value && value !== "") prev.set(key, value);
        else prev.delete(key);
      });
      prev.set("page", "1"); // Reset pagination
      return prev;
    });
  };

  const handleDownload = (format) => {
    toast.loading(`Generating ${format.toUpperCase()} report...`);
    downloadReport(queryParams, format);
    setTimeout(() => toast.dismiss(), 2000); // Clear toast
  };

  // 4. Table Columns
  const columns = [
    {
      header: "Date / Period",
      key: "_id", // The aggregation group key (e.g., "2025-10-25" or "2025-43")
      render: (item) => (
        <span className="font-medium text-gray-900">{item._id}</span>
      ),
    },
    {
      header: "Total Orders",
      key: "totalOrders",
      render: (item) => item.totalOrders,
    },
    {
      header: "Total Sales",
      key: "totalSales",
      render: (item) => (
        <span className="font-bold text-gray-900">
          {formatRupee(item.totalSales)}
        </span>
      ),
    },
    {
      header: "Total Discount",
      key: "totalDiscount",
      render: (item) => (
        <span className="text-orange-600">
          {formatRupee(item.totalDiscount)}
        </span>
      ),
    },
    {
      header: "Total Special Discount",
      key: "specialDiscount",
      render: (item) => (
        <span className="text-orange-600">
          {formatRupee(item.totalSpecialDiscount)}
        </span>
      ),
    },
    {
      header: "Total Coupon Discount",
      key: "couponDiscount",
      render: (item) => (
        <span className="text-orange-600">
          {formatRupee(item.totalCouponDiscount)}
        </span>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner text="Generating report..." />;
  if (isError) return <ErrorDisplay error={error} />;

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-black text-white rounded-lg">
          <BarChart3 size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
      </div>

      <ReportStatsGrid summary={summary} />

      <ReportFilters
        filters={urlParams}
        onFilterChange={onCustomFilterChange}
        onDownload={handleDownload}
      />

      <DynamicTable
        title="Sales Data"
        columns={columns}
        data={reportData}
        pagination={pagination}
        isLoading={isLoading}
        // Pass standard handlers
        limit={queryParams.limit}
        onPageChange={(page) => onCustomFilterChange({ page })}
        onLimitChange={(limit) => onCustomFilterChange({ limit })}
        searchValue=""
        onSearchChange={() => {}}
        status=""
        onStatusChange={() => {}}
        sortConfig={{}}
        onSort={() => {}}
        showSearch={false}
      />
    </div>
  );
};

export default SalesReportPage;
