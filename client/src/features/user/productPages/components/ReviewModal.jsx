import React, { useState } from "react";
import { useCreateReview } from "../reviewHooks.js";
import { Star, X, Loader2 } from "lucide-react";

const ReviewModal = ({ open, onClose, productId }) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [form, setForm] = useState({
    rating: 0,
    comment: "",
  });

  // Destructure isPending to handle loading states
  const { mutate, isPending } = useCreateReview();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    mutate(
      { ...form, productId },
      {
        onSuccess: () => {
          // Reset form and close
          setForm({ rating: 0, comment: "" });
          onClose();
        },
      }
    );
  };

  // Handle closing when clicking the backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Write a Review
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Overall Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-transform hover:scale-110 focus:outline-none"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setForm({ ...form, rating: star })}
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoveredStar || form.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-100 text-gray-300"
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 min-h-[1.25rem]">
              {form.rating > 0
                ? ["Poor", "Fair", "Good", "Very Good", "Excellent"][
                    form.rating - 1
                  ]
                : "Select a rating"}
            </p>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Experience
            </label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-gray-300 p-3 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black resize-none"
              placeholder="What did you like or dislike? What was the quality like?"
              required
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {form.comment.length}/100 characters
            </p>
          </div>

          {/* Footer / Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || form.rating === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
