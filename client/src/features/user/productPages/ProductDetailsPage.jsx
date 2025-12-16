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

  return (
    <div className="bg-white">
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
