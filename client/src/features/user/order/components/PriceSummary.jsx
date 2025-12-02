import React from "react";
import PropTypes from "prop-types";
import { formatRupee } from "../../../../utils/currency.js";

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

  const discountItems = [
    { label: "Discount", value: discount },
    { label: "Special Discount", value: specialDiscount },
    { label: "Coupon Discount", value: couponDiscount },
    { label: "Referral Bonus", value: referralBonus },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="font-semibold text-gray-900 mb-4">Payment Summary</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatRupee(subtotal)}</span>
        </div>
        {discountItems.map(
          (item) =>
            item.value > 0 && (
              <div
                key={item.label}
                className="flex justify-between text-green-600"
              >
                <span>{item.label}</span>
                <span>- {formatRupee(item.value)}</span>
              </div>
            )
        )}
        <div className="flex justify-between text-gray-600">
          <span>Delivery</span>
          <span>{deliveryFee === 0 ? "Free" : formatRupee(deliveryFee)}</span>
        </div>
        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>{formatRupee(total)}</span>
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
