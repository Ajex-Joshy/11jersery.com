import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { S3_URL } from "../../../../utils/constants";
import StarRating from "../../../../components/common/StarRating";
import { formatRupee } from "../../../../utils/currency";

const ProductCard = ({ product }) => {
  console.log("product card", product);
  // --- 2. Calculate discount ---
  const listPrice = product.price.list;
  const salePrice = product.price.sale;
  const hasDiscount = salePrice < listPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((listPrice - salePrice) / listPrice) * 100)
    : 0;

  // --- 3. Rating ---
  const averageRating = product.rating?.average;

  return (
    <Link
      to={`/product/${product.slug}`}
      // --- 4. Styling the Card Container ---
      className="group block overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col" // Added flex-col
    >
      {/* Image container with background */}
      <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-xl">
        <img
          src={product?.imageUrls?.[0] || product?.imageUrl}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 mix-blend-multiply" // Use object-contain and mix-blend
          onError={(e) => {
            e.target.src =
              "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg";
          }}
        />
      </div>
      {/* Details Section */}
      <div className="p-4 space-y-2 flex flex-col grow">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight group-hover:text-blue-600 mb-1">
          {product.title}
        </h3>
        {/* Rating */}
        {averageRating != null && (
          <div className="flex items-center">
            <StarRating rating={averageRating} size={16} />{" "}
            {/* Use StarRating component */}
            <span className="ml-2 text-sm text-gray-600">
              {averageRating.toFixed(1)}/5
            </span>
          </div>
        )}
        {/* Price & Discount */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {" "}
          <span className="text-lg font-bold text-gray-900">
            {formatRupee(salePrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              {formatRupee(listPrice)}
            </span>
          )}
          {hasDiscount && (
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              -{discountPercentage}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
    price: PropTypes.shape({
      list: PropTypes.number.isRequired,
      sale: PropTypes.number.isRequired,
    }).isRequired,
    rating: PropTypes.shape({
      average: PropTypes.number,
    }),
  }).isRequired,
};

export default ProductCard;
