import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { useProductPageData } from "./productHooks";

import ProductImageGallery from "./components/ProductImageGallery";
import ProductPurchaseForm from "./components/ProductPurchaseForm";
import ProductInfoTabs from "./components/ProductInfoTabs";
import ProductCarousel from "./components/ProductCarousel";
import SizeGuideModal from "./components/SizeGuideModal";
import ProductPageSkeleton from "./components/ProductPageSkeleton";
import { useProductReviews } from "./reviewHooks";

const ProductDetailsPage = () => {
  const { slug } = useParams(); // Get slug from URL
  const { data, isLoading, isError, error } = useProductPageData(slug);

  const { data: reviewData } = useProductReviews(
    data?.detailsData?.product?._id,
    1,
    5
  );

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const openSizeModal = () => setIsSizeModalOpen(true);
  const closeSizeModal = () => setIsSizeModalOpen(false);

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
  const otherProducts = data?.detailsData?.otherProducts;
  const faqs = data?.faqsData;

  const reviews = reviewData?.reviews || [];

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
            imageUrls={product.imageUrls}
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
