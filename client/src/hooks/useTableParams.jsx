import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

/**
 * A reusable hook to manage all URL state for a dynamic table.
 * Handles page, limit, status, search, and sorting.
 */

export const useTableParams = ({
  defaultSortBy = "createdAt",
  defaultSortOrder = "desc",
} = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // --- Read all values from the URL ---
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const status = searchParams.get("status") || "";

  const sortConfig = useMemo(
    () => ({
      field: searchParams.get("sortBy") || defaultSortBy,
      direction: searchParams.get("sortOrder") || defaultSortOrder,
    }),
    [searchParams, defaultSortBy, defaultSortOrder]
  );

  // Debounce the search term for the API
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // --- Create the API-ready query object ---
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status,
      search: debouncedSearchTerm,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.direction,
    }),
    [page, limit, status, debouncedSearchTerm, sortConfig]
  );

  // --- Handlers to update the URL ---
  // We use a single function to avoid creating 6 different handlers
  const updateParams = (newParams) => {
    Object.entries(newParams).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
    setSearchParams(searchParams);
  };

  const handleSort = (field) => {
    const direction =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    updateParams({ sortBy: field, sortOrder: direction, page: "1" });
  };

  const handleSearch = (value) => {
    updateParams({ search: value, page: "1" });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage.toString() });
  };

  const handleLimitChange = (newLimit) => {
    updateParams({ limit: newLimit.toString(), page: "1" });
  };

  const handleStatusChange = (newStatus) => {
    updateParams({ status: newStatus, page: "1" });
  };

  // Return everything the UI needs
  return {
    queryParams,

    // The current, non-debounced UI state
    uiState: {
      page,
      limit,
      status,
      searchTerm,
      sortConfig,
    },

    // All the handlers for the table to call
    handlers: {
      onSort: handleSort,
      onSearchChange: handleSearch,
      onPageChange: handlePageChange,
      onLimitChange: handleLimitChange,
      onStatusChange: handleStatusChange,
    },
  };
};
