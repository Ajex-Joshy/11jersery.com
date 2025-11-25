import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { S3_URL } from "../../../../utils/constants";

const CollectionCard = ({ collection }) => {
  const imageUrl = collection.cloudinaryImageId
    ? `${S3_URL}/${collection.cloudinaryImageId}` // Construct image URL
    : "https://acube.delighterp.com/uploaded/acube_delighterp_com/product/default_product_image.jpg"; // Fallback image

  return (
    <Link
      to={`/collection/${collection.slug}`}
      className="group relative block aspect-4/3 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <img
        src={imageUrl}
        alt={collection.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          e.target.src = "/placeholder-collection.png";
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="text-lg font-semibold text-white group-hover:underline">
          {collection.title}
        </h3>
      </div>
    </Link>
  );
};

CollectionCard.propTypes = {
  collection: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    cloudinaryImageId: PropTypes.string,
  }).isRequired,
};

export default CollectionCard;
