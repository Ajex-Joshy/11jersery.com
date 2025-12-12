import React, { useState } from "react";
import PropTypes from "prop-types";
import StarRating from "../../../../components/common/StarRating";
import AccordionItem from "./AccordionItem";
import ReviewModal from "./ReviewModal";
import { useDeleteReview } from "../reviewHooks";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../account/authSlice";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";
import { Trash } from "lucide-react";

// --- Tab: Product Details ---
const ProductDetailsTab = ({ product }) => (
  <div className="max-w-2xl mx-auto space-y-4">
    <h3 className="text-xl font-semibold mb-2">Product Description</h3>
    <p className="text-sm text-gray-600 leading-relaxed">
      {product.description}
    </p>

    <h3 className="text-xl font-semibold mb-2 pt-4">Product Details</h3>
    <ul className="space-y-2 text-sm text-gray-600">
      {product.details?.map((detail, index) => (
        <li key={index} className="grid grid-cols-2 gap-2">
          <span className="font-medium text-gray-800">{detail.attribute}:</span>
          <span>{detail.description}</span>
        </li>
      ))}
    </ul>
  </div>
);

ProductDetailsTab.propTypes = {
  product: PropTypes.shape({
    description: PropTypes.string.isRequired,
    details: PropTypes.arrayOf(
      PropTypes.shape({
        attribute: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

// --- Tab: Product Reviews ---
const ProductReviewsTab = ({ reviews = [], productId }) => {
  const [openModal, setOpenModal] = useState(false);
  const deleteReview = useDeleteReview();
  const currentUser = useSelector(selectCurrentUser);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedReviewId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    deleteReview.mutate(selectedReviewId);
    setConfirmOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-semibold">
          All Reviews ({reviews.length})
        </h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setOpenModal(true)}
            className="bg-black text-white text-sm px-3 py-1.5 rounded-md hover:bg-gray-800"
          >
            Write a Review
          </button>
        </div>
      </div>
      <ReviewModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        productId={productId}
      />

      <div className="space-y-6">
        {reviews.map((review) => {
          review.isMine = currentUser?._id === review.userId;
          return (
            <div key={review._id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">
                  {review.userName}
                </span>
                <span className="text-xs text-gray-500">{review.place}</span>

                {review.isMine && (
                  <button
                    onClick={() => handleDeleteClick(review._id)}
                    className="ml-auto"
                  >
                    <Trash className="w-4 h-4 text-red-600 hover:text-red-700" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} size={14} />
                {/* <span className="text-xs text-gray-500">{review.postedOn}</span> */}
              </div>
              <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
            </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
        isLoading={deleteReview.isPending}
      />
    </div>
  );
};
ProductReviewsTab.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userName: PropTypes.string.isRequired,
      place: PropTypes.string,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string,
    })
  ),
};

// --- Tab: FAQs ---
const ProductFaqsTab = ({ faqs = [] }) => (
  <div className="max-w-2xl mx-auto">
    <h3 className="text-xl font-semibold mb-4 text-center">
      Frequently Asked Questions
    </h3>
    <div className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} title={faq.question}>
          {faq.answer}
        </AccordionItem>
      ))}
    </div>
  </div>
);

ProductFaqsTab.propTypes = {
  faqs: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ),
};

// --- Main Tabs Component ---
const TABS = ["Product Details", "Rating & Reviews", "FAQs"];

const ProductInfoTabs = ({ product, reviews, faqs }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "Product Details":
        return <ProductDetailsTab product={product} />;
      case "Rating & Reviews":
        return <ProductReviewsTab reviews={reviews} productId={product._id} />;
      case "FAQs":
        return <ProductFaqsTab faqs={faqs} />;
      default:
        return null;
    }
  };

  return (
    <div className="py-12 border-t border-gray-200">
      {/* Tab Headers */}
      <div className="flex justify-center border-b border-gray-200 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 md:px-6 py-3 text-sm font-semibold
              ${
                activeTab === tab
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-800"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="container mx-auto px-4">{renderTabContent()}</div>
    </div>
  );
};

ProductInfoTabs.propTypes = {
  product: PropTypes.shape({
    description: PropTypes.string.isRequired,
    details: PropTypes.arrayOf(
      PropTypes.shape({
        attribute: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      userName: PropTypes.string.isRequired,
      place: PropTypes.string,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string,
    })
  ),
  faqs: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ),
};

export default ProductInfoTabs;
