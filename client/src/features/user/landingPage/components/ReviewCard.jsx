import React from "react";
import StarRating from "../../../../components/common/StarRating"; // Adjust path
import { CheckCircle } from "lucide-react"; // For verified badge

const ReviewCard = ({ review }) => {
  return (
    <div className="flex-shrink-0 w-72 md:w-80 bg-white p-6 rounded-lg shadow-md border border-gray-100 space-y-3">
      <StarRating rating={review.rating} />
      <p className="text-sm text-gray-700 leading-relaxed italic">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-2 pt-2">
        <span className="font-semibold text-gray-800">{review.userName}</span>
        <span className="text-xs text-gray-500"> - {review.place}</span>
        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />{" "}
        {/* Verified badge */}
      </div>
    </div>
  );
};

export default ReviewCard;
