import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";
import PropTypes from "prop-types";

const AddressCard = ({ address, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(address._id);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 relative group hover:border-gray-400 transition bg-white">
        {/* Edit Icon */}
        <Link
          to={`/account/addresses/edit/${address._id}`}
          className="absolute top-4 right-10 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition"
          title="Edit Address"
        >
          <Edit2 size={18} />
        </Link>

        <button
          onClick={handleDeleteClick}
          className="absolute top-4 right-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition"
          title="Delete Address"
          type="button"
        >
          <Trash2 size={18} />
        </button>

        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {address.firstName} {address.lastName}
        </h3>

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p className="font-medium text-gray-800">{address.type}</p>{" "}
          <p>{address.addressLine1}</p>
          {address.addressLine2 && <p>{address.addressLine2}</p>}
          <p>
            {address.city}, {address.state}
          </p>
          <p>{address.pinCode}</p>
          <p>{address.country} </p>
          <p className="mt-2 font-medium">{address.phone}</p>
        </div>

        <div className="flex gap-3 mt-6">
          {address.isDefault && (
            <span className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-md">
              default
            </span>
          )}
          {address.addressName && (
            <span className="bg-blue-600 ml-auto text-white text-xs font-semibold px-4 py-2 rounded-md">
              {address.addressName}
            </span>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Delete Address"
        message="Are you sure you want to delete this address? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={handleCancel}
      />
    </>
  );
};

AddressCard.propTypes = {
  address: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    type: PropTypes.string,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    pinCode: PropTypes.string,
    country: PropTypes.string,
    phone: PropTypes.string,
    isDefault: PropTypes.bool,
    addressName: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default AddressCard;
