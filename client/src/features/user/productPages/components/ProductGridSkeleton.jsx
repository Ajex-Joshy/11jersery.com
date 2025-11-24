const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-pulse">
    {[...Array(9)].map((_, i) => (
      <div
        key={i}
        className="rounded-xl shadow-sm border border-gray-100 bg-white"
      >
        <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
