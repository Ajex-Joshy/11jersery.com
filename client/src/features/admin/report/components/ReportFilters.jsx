import React from "react";
import { Calendar, FileDown, Filter } from "lucide-react";

const periods = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const ReportFilters = ({ filters, onFilterChange, onDownload }) => {
  const handleDateChange = (e) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  const handlePeriodChange = (e) => {
    onFilterChange({ period: e.target.value, page: 1 }); // Reset to page 1 on period change
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* Period Selector */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Report Type
          </label>
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              value={filters.period}
              onChange={handlePeriodChange}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black bg-white"
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            Start Date
          </label>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              name="startDate"
              value={filters.startDate || ""}
              onChange={handleDateChange}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">
            End Date
          </label>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate || ""}
              onChange={handleDateChange}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-black focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Download Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onDownload("pdf")}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100 transition"
        >
          <FileDown size={16} /> PDF
        </button>
        <button
          onClick={() => onDownload("excel")}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-md text-sm font-medium hover:bg-green-100 transition"
        >
          <FileDown size={16} /> Excel
        </button>
      </div>
    </div>
  );
};

export default ReportFilters;
