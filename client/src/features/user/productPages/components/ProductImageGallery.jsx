import React, { useState, useEffect } from "react";
import { S3_URL } from "../../../../utils/constants";

const ProductImageGallery = ({ imageIds = [], title }) => {
  const [mainImage, setMainImage] = useState(
    "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg"
  );

  useEffect(() => {
    console.log(imageIds);
    // Set the first image as the main image when the component loads
    if (imageIds.length > 0) {
      setMainImage(`${S3_URL}/images/${imageIds[0]}`);
    }
  }, [imageIds]);

  const getImageUrl = (id) =>
    id
      ? `${S3_URL}/images/${id}`
      : "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg"; // Fallback

  const handleThumbnailClick = (imageId) => {
    setMainImage(getImageUrl(imageId));
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <div className="flex md:flex-col gap-3 justify-center md:justify-start">
        {imageIds.map((id, index) => (
          <button
            key={index}
            className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
              mainImage.includes(id)
                ? "border-black" // Highlight active thumbnail
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => handleThumbnailClick(id)}
          >
            <img
              src={getImageUrl(id)}
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
