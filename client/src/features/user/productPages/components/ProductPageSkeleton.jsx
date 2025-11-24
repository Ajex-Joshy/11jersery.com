const ProductPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>{" "}
    {/* Breadcrumbs */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Image Skeleton */}
      <div className="flex flex-col-reverse md:flex-row gap-4">
        <div className="flex md:flex-col gap-3 justify-center md:justify-start">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg"></div>
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex-grow aspect-square bg-gray-200 rounded-xl"></div>
      </div>
      {/* Info Skeleton */}
      <div className="space-y-5">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3 mt-4"></div>
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-32 bg-gray-200 rounded-md"></div>
          <div className="h-12 flex-grow bg-gray-200 rounded-md"></div>
          <div className="h-12 w-12 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductPageSkeleton;
