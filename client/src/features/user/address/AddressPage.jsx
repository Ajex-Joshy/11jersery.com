import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useAddresses, useDeleteAddress } from "./addressHooks";
import {
  LoadingSpinner,
  ErrorDisplay,
} from "../../../components/common/StateDisplays";

import AddressCard from "./components/AddressCard";

const AddressesPage = () => {
  const navigate = useNavigate();
  const { data: addressesPayload, isLoading, isError, error } = useAddresses();
  const { mutate: deleteAddress } = useDeleteAddress();

  if (isLoading) return <LoadingSpinner text="Loading addresses..." />;
  if (isError) return <ErrorDisplay error={error} />;

  const addresses = addressesPayload?.data || []; // Adjust based on API response structure

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Addresses</h1>

      {/* Add New Address Banner */}
      <button
        onClick={() => navigate("/account/addresses/new")}
        className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 flex items-center justify-center gap-2 text-gray-600 font-semibold hover:bg-gray-200 hover:border-gray-400 transition mb-8"
      >
        <Plus size={20} />
        ADD NEW ADDRESS
      </button>

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No addresses saved yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses?.data?.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onDelete={(id) => deleteAddress(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
