import React from "react";
import { Search, Download, ArrowUp, ArrowDown } from "lucide-react";
import Pagination from "../common/Pagination";
import PropTypes from "prop-types";

const DynamicTable = ({
  title,
  columns,
  data,
  searchValue,
  onSearchChange,
  status,
  onStatusChange,
  limit,
  onLimitChange,
  sortConfig,
  onSort,
  pagination,
  onPageChange,
}) => {
  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 md:flex-auto">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100">
            <Download className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  <div
                    className={`flex items-center gap-1 ${
                      col.sortable ? "cursor-pointer" : ""
                    }`}
                  >
                    {col.header}
                    {col.sortable && (
                      <span className="w-4 h-4">
                        {sortConfig.field === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUp className="w-4 h-4 text-gray-300" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item._id || index} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-6 py-4 whitespace-nowrap text-sm"
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Footer with Pagination & Limit --- */}
      {pagination && (
        <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
          {/* 3. Limit (Rows per page) Dropdown */}
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="pl-2 pr-6 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Pagination Component */}
          <Pagination pagination={pagination} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};


DynamicTable.propTypes = {
  title: PropTypes.string.isRequired,

  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.node.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func.isRequired,
    })
  ).isRequired,

  data: PropTypes.array.isRequired,

  searchValue: PropTypes.string.isRequired,

  onSearchChange: PropTypes.func.isRequired,

  status: PropTypes.string.isRequired,

  onStatusChange: PropTypes.func.isRequired,

  limit: PropTypes.number.isRequired,

  onLimitChange: PropTypes.func.isRequired,

  sortConfig: PropTypes.shape({
    field: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }).isRequired,

  onSort: PropTypes.func.isRequired,

  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    totalProducts: PropTypes.number,
    limit: PropTypes.number,
  }),

  onPageChange: PropTypes.func.isRequired,
};


export default DynamicTable;
