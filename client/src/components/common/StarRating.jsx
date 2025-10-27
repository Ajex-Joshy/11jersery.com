import React from "react";
import { Star, StarHalf } from "lucide-react";

const StarRating = ({ rating, size = 16 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          fill="currentColor"
          size={size}
          strokeWidth={0}
        />
      ))}
      {halfStar && (
        <StarHalf key="half" fill="currentColor" size={size} strokeWidth={0} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} size={size} strokeWidth={1} />
      ))}
    </div>
  );
};

export default StarRating;
