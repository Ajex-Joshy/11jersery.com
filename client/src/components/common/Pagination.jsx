import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

const Pagination = ({ pagination, onPageChange }) => {
  const {
    currentPage,
    totalPages,
    totalUsers,
    totalOrders,
    limit,
    totalTransactions,
  } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const startItem = (currentPage - 1) * limit + 1;
  let totalItem = totalUsers || totalOrders || totalTransactions;
  const endItem = Math.min(currentPage * limit, totalItem);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700 mb-2 md:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalPages}</span> results
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* We'll keep this simple for now. You can add page numbers here. */}
        <span className="px-4 py-2 text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
Pagination.propTypes = {
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalUsers: PropTypes.number.isRequired,
    limit: PropTypes.number.isRequired,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
};
export default Pagination;
