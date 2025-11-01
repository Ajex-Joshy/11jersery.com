import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { useProductPageData } from "./productHooks";

import ProductImageGallery from "./components/ProductImageGallery";
import ProductPurchaseForm from "./components/ProductPurchaseForm";
import ProductInfoTabs from "./components/ProductInfoTabs";
import ProductCarousel from "./components/ProductCarousel";
import SizeGuideModal from "./components/SizeGuideModal";

// Loading Skeleton
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

const ProductDetailsPage = () => {
  const { slug } = useParams(); // Get slug from URL
  const { data, isLoading, isError, error } = useProductPageData(slug);

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const openSizeModal = () => setIsSizeModalOpen(true);
  const closeSizeModal = () => setIsSizeModalOpen(false);
  console.log(isSizeModalOpen);

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading product: {error.message}
      </div>
    );
  }

  // Deconstruct the data
  const product = data?.detailsData?.product;
  const reviews = data?.detailsData?.reviews;
  const otherProducts = data?.detailsData?.otherProducts;
  const faqs = data?.faqsData;

  if (!product) {
    return (
      <div className="p-8 text-center text-gray-500">Product not found.</div>
    );
  }

  // Example breadcrumbs (replace with real data if available)
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Top Selling", href: "/collections/top-selling" },
    { name: product.title, href: `/product/${product.slug}` },
  ];

  return (
    <div className="bg-white">
      {/* Breadcrumbs */}
      <nav className="container mx-auto px-4 py-4 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <ChevronRight size={14} />}
              <Link
                to={crumb.href}
                className={`
                  ${
                    index === breadcrumbs.length - 1
                      ? "font-medium text-gray-700 pointer-events-none" // Last item
                      : "hover:text-gray-900"
                  }
                `}
                aria-current={
                  index === breadcrumbs.length - 1 ? "page" : undefined
                }
              >
                {crumb.name === "Home" ? <Home size={14} /> : crumb.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <ProductImageGallery
            imageIds={product.imageIds}
            title={product.title}
          />
          <ProductPurchaseForm
            product={product}
            onOpenSizeGuide={openSizeModal}
          />
        </div>
      </div>

      {/* Tabs Section */}
      <ProductInfoTabs product={product} reviews={reviews} faqs={faqs} />

      {/* "You might also like" Section */}
      {otherProducts && (
        <ProductCarousel
          title={otherProducts.title}
          products={otherProducts.products}
        />
      )}
      <SizeGuideModal isOpen={isSizeModalOpen} onClose={closeSizeModal} />
    </div>
  );
};

export default ProductDetailsPage;
