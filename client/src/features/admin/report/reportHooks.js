import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-hot-toast";
export const SALES_REPORT_KEY = "salesReport";

/**
 * Fetches the sales report data.
 * @param {object} params - { startDate, endDate, period, page, limit }
 */
export const getSalesReport = async (params) => {
  const { data } = await axiosInstance.get("/admin/reports", { params });
  return data.data; // Expects { payload: { report: [], summary: {}, pagination: {} } }
};

/**
 * Hook to use the sales report data.
 */
export const useSalesReport = (params) => {
  return useQuery({
    queryKey: [SALES_REPORT_KEY, params],
    queryFn: () => getSalesReport(params),
    keepPreviousData: true, // Smooth transitions when filtering
  });
};

/**
 * Function to trigger the report download.
 * @param {object} params - Current filters
 * @param {string} format - 'pdf' or 'excel'
 */
export const downloadReport = async (params, format) => {
  try {
    const response = await axiosInstance.get("/admin/reports/download", {
      params: { ...params, format },
      responseType: "blob", // Important for file download
    });

    // Create a blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const extension = format === "excel" ? "xlsx" : "pdf";
    link.setAttribute(
      "download",
      `sales_report_${params.period || "custom"}.${extension}`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    toast.error(
      error?.response?.data?.error?.message ||
        "Failed to download sales report. Please try again."
    );
  }
};
