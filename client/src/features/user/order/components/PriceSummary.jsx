import React from "react";
import PropTypes from "prop-types";

const PriceSummary = ({ price }) => {
  if (!price) return null;

  const {
    subtotal,
    discount,
    specialDiscount,
    referralBonus,
    deliveryFee,
    couponDiscount,
    total,
  } = price;

  const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="font-semibold text-gray-900 mb-4">Payment Summary</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="text-green-600">Discount</span>
          <span className="text-green-600">- {formatCurrency(discount)}</span>
        </div>
        {specialDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Special Discount</span>
            <span className="font-medium text-green-600">
              - {formatCurrency(specialDiscount)}
            </span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Coupon Discount</span>
            <span className="font-medium text-green-600">
              - {formatCurrency(couponDiscount)}
            </span>
          </div>
        )}
        {referralBonus > 0 && (
          <div className="flex justify-between">
            <span className="text-green-600">Referral Bonus</span>
            <span className="font-medium text-green-600">
              - {formatCurrency(referralBonus)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>
            {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
          </span>
        </div>
        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

PriceSummary.propTypes = {
  price: PropTypes.shape({
    subtotal: PropTypes.number.isRequired,
    discount: PropTypes.number.isRequired,
    specialDiscount: PropTypes.number,
    referralBonus: PropTypes.number,
    deliveryFee: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default PriceSummary;
