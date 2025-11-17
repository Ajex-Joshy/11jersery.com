import React, { useState, useEffect } from "react";
import { S3_URL } from "../../../../utils/constants";

const ProductImageGallery = ({ imageUrls = [], title }) => {
  const [mainImage, setMainImage] = useState(
    "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg"
  );
  useEffect(() => {
    setMainImage(imageUrls[0]);
  }, [imageUrls]);

  const handleThumbnailClick = (url) => {
    setMainImage(url);
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3 justify-center md:justify-start">
        {imageUrls.map((url, index) => (
          <button
            key={index}
            className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
              mainImage.includes(url)
                ? "border-black" // Highlight active thumbnail
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => handleThumbnailClick(url)}
          >
            <img
              src={url}
              alt={`${title} thumbnail ${index + 1}`}
              className="w-full h-full object-cover bg-gray-100"
              onError={(e) => {
                e.target.src =
                  "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg";
              }}
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-grow aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-contain" // Use object-contain
          onError={(e) => {
            e.target.src =
              "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg";
          }}
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;
