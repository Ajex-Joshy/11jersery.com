const CartPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 md:py-12 animate-pulse">
    {/* Breadcrumbs */}
    <div className="h-4 w-1/4 bg-gray-200 rounded mb-6"></div>
    {/* Header */}
    <div className="h-8 w-1/3 bg-gray-200 rounded mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-2 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded-md"></div>
          </div>
        ))}
      </div>
      {/* Right Column Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="h-6 w-1/2 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-6 w-3/4 bg-gray-200 rounded mt-6 mb-4"></div>
          <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

export default CartPageSkeleton;
