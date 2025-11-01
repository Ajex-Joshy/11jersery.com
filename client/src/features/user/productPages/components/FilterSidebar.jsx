import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
// import CategoryFilter from "./CategoryFilter";
// import SizeFilter from "./SizeFilter";
// import PriceFilter from "./PriceFilter";

const FilterSidebar = ({
  metadata,
  activeFilters,
  onFilterChange,
  onPriceChange,
  onClearFilters,
}) => {
  const filters = metadata?.filters || {};

  // Check if any filters are active
  const hasActiveFilters = Object.values(activeFilters).some((val) => val);

  return (
    <aside className="w-full lg:w-64 xl:w-72">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal size={18} /> Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-6">
        <CategoryFilter
          categories={filters.availableClubs || []}
          activeCategory={activeFilters.category}
          onCategoryChange={(slug) => onFilterChange("category", slug)}
        />

        <SizeFilter
          sizes={filters.availableSizes || []}
          activeSize={activeFilters.size}
          onSizeChange={(size) => onFilterChange("size", size)}
        />

        <PriceFilter
          range={filters.priceRange}
          activePrice={activeFilters.price}
          onPriceChange={onPriceChange}
        />

        {/* 'Apply Filter' button (needed for price range) */}
        <button
          onClick={() => onPriceChange(activeFilters.price)} // Re-apply to trigger submit
          className="w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Apply Filter
        </button>
      </div>
    </aside>
  );
};

// --- Sub-Components (can be in the same file or separate) ---

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => (
  <div>
    <h3 className="font-semibold mb-3">Club</h3>
    <ul className="space-y-1.5 max-h-60 overflow-y-auto">
      {categories.map((cat) => (
        <li key={cat.slug}>
          <button
            onClick={() => onCategoryChange(cat.slug)}
            className={`flex justify-between items-center w-full text-left text-sm ${
              activeCategory === cat.slug
                ? "font-bold text-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <span>{cat.name}</span>
            <span className="text-xs text-gray-400">{cat.count}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

const SizeFilter = ({ sizes, activeSize, onSizeChange }) => (
  <div className="border-t border-gray-200 pt-6">
    <h3 className="font-semibold mb-3">Size</h3>
    <div className="grid grid-cols-3 gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSizeChange(size)}
          className={`
            border text-center text-sm font-medium py-2 rounded-md transition
            ${
              activeSize === size
                ? "bg-black text-white border-black"
                : "bg-white border-gray-300 hover:border-black"
            }
          `}
        >
          {size}
        </button>
      ))}
    </div>
  </div>
);

const PriceFilter = ({ range, activePrice, onPriceChange }) => {
  // Internal state for inputs, only call parent `onPriceChange` on 'Apply'
  // Or, for simplicity here, we'll just link directly
  const handleMinChange = (e) =>
    onPriceChange({ ...activePrice, min: e.target.value });
  const handleMaxChange = (e) =>
    onPriceChange({ ...activePrice, max: e.target.value });

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="font-semibold mb-3">Price</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={`₹${range?.starts || 0}`}
          value={activePrice.min || ""}
          onChange={handleMinChange}
          className="w-full border border-gray-300 rounded-md p-2 text-sm text-center"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          placeholder={`₹${range?.ends || 5000}`}
          value={activePrice.max || ""}
          onChange={handleMaxChange}
          className="w-full border border-gray-300 rounded-md p-2 text-sm text-center"
        />
      </div>
      {/* TODO: Add a price range slider component here */}
    </div>
  );
};

export default FilterSidebar;
