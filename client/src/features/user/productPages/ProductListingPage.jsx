import React from "react";
import { useSearchParams, Link, useParams } from "react-router-dom";
import { Home, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useProductsListing } from "./productHooks";

import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
import Pagination from "../../../components/common/Pagination";
import ProductGridSkeleton from "./components/ProductGridSkeleton";

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Get category from URL path, e.g., /collections/:slug
  const { slug: categorySlug } = useParams();

  // --- Read state from URL Search Params ---
  // We must set the 'category' from the path slug if it's not already in the search params
  if (categorySlug && !searchParams.has("category")) {
    searchParams.set("category", categorySlug);
  }

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useProductsListing(searchParams);

  // --- Extract data from response ---
  const metadata = response?.data?.metadata;
  const pageData = response?.data?.data;
  const products = pageData?.products || [];
  const pagination = metadata?.pagination;

  // --- Create active filter object to pass to sidebar ---
  const activeFilters = {
    category: searchParams.get("category") || "",
    size: searchParams.get("size") || "",
    price: {
      min: searchParams.get("minPrice") || "",
      max: searchParams.get("maxPrice") || "",
    },
  };

  // --- Handlers to update URL search params ---
  const handleFilterChange = (key, value) => {
    // If user clicks the same filter, toggle it off
    const newValue = activeFilters[key] === value ? "" : value;
    setSearchParams(
      (prev) => {
        if (newValue) {
          prev.set(key, newValue);
        } else {
          prev.delete(key);
        }
        prev.set("page", "1"); // Reset to page 1
        return prev;
      },
      { replace: true }
    ); // Use replace to avoid polluting browser history
  };

  const handlePriceChange = ({ min, max }) => {
    setSearchParams(
      (prev) => {
        min ? prev.set("minPrice", min) : prev.delete("minPrice");
        max ? prev.set("maxPrice", max) : prev.delete("maxPrice");
        prev.set("page", "1");
        return prev;
      },
      { replace: true }
    );
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSearchParams(
      (prev) => {
        prev.set("sortBy", newSort.split("-")[0]); // e.g., "price.sale"
        prev.set("sortOrder", newSort.split("-")[1]); // e.g., "desc"
        prev.set("page", "1");
        return prev;
      },
      { replace: true }
    );
  };

  const handlePageChange = (newPage) => {
    setSearchParams(
      (prev) => {
        prev.set("page", newPage.toString());
        return prev;
      },
      { replace: true }
    );
  };

  const handleClearFilters = () => {
    setSearchParams(
      (prev) => {
        // Keep essential params like search, but clear filters
        const newParams = new URLSearchParams();
        if (prev.has("search")) newParams.set("search", prev.get("search"));
        return newParams;
      },
      { replace: true }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs (same as Product Details page) */}
      <nav className="mb-4 text-sm flex items-center gap-2 text-gray-500">
        <Link to="/" className="hover:text-gray-900">
          <Home size={14} />
        </Link>
        <ChevronRight size={14} />
        {/* Title comes from the API response */}
        <span className="font-medium text-gray-700">
          {pageData?.categoryTitle || "Products"}
        </span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
        {/* --- Filters --- */}
        <div className="lg:col-span-1">
          <FilterSidebar
            metadata={metadata}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onPriceChange={handlePriceChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* --- Product List & Sort --- */}
        <main className="lg:col-span-3">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">
              {pageData?.categoryTitle || "Products"}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">
                Showing {pagination?.totalProducts || 0} products
              </span>
              <span className="text-gray-300">|</span>
              <label htmlFor="sort" className="text-gray-600">
                Sort by:
              </label>
              <select
                id="sort"
                value={`${searchParams.get("sortBy") || "createdAt"}-${
                  searchParams.get("sortOrder") || "desc"
                }`}
                onChange={handleSortChange}
                className="border border-gray-300 rounded-md py-1.5 px-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black"
              >
                {metadata?.sorting?.availableSorts.map((sort) => (
                  <option key={sort.key} value={sort.key}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <ProductGridSkeleton />
          ) : isError ? (
            <div className="text-center text-red-500">
              Error: {error.message}
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Pagination */}
          <div className="mt-12">
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductListingPage;
