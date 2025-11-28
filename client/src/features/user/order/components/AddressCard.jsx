// client/src/features/user/order/components/AddressCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { MapPin } from "lucide-react";

const AddressCard = ({ address, title = "Shipping Address" }) => {
  if (!address) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin size={20} className="text-gray-400" /> {title}
      </h2>
      <address className="not-italic text-sm text-gray-600 leading-relaxed">
        <strong className="text-gray-900 block mb-1">
          {address.firstName} {address.lastName}
        </strong>
        {address.addressLine1}
        <br />
        {address.addressLine2 && (
          <>
            {address.addressLine2}
            <br />
          </>
        )}
        {address.city}, {address.state}
        <br />
        {address.pinCode}
        <br />
        {address.country}
        <br />
        <span className="block mt-2">Phone: {address.phoneNumber}</span>
      </address>
    </div>
  );
};

AddressCard.propTypes = {
  address: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    addressLine1: PropTypes.string.isRequired,
    addressLine2: PropTypes.string,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    pinCode: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string.isRequired,
  }).isRequired,
  title: PropTypes.string,
};

export default AddressCard;
