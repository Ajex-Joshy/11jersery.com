import React from "react";
import { Plus, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAddresses } from "../../address/addressHooks";

const AddressSelection = ({ selectedId, onSelect }) => {
  const navigate = useNavigate();
  const { data: addressesPayload, isLoading } = useAddresses();
  const addresses = addressesPayload?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
        <button
          onClick={() => navigate("/account/addresses/new")}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-500">
          <MapPin className="mx-auto mb-2 opacity-50" size={32} />
          <p>No addresses found.</p>
          <button
            onClick={() => navigate("/account/addresses/new")}
            className="mt-3 text-black font-semibold underline hover:text-gray-700"
          >
            Add a shipping address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {addresses?.data?.map((addr) => {
            const isSelected = selectedId === addr._id;
            return (
              <div
                key={addr._id}
                onClick={() => onSelect(addr._id)}
                className={`
                  relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? "border-black bg-gray-50 ring-1 ring-black"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`font-bold ${
                        isSelected ? "text-black" : "text-gray-700"
                      }`}
                    >
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2
                      className="text-black"
                      size={20}
                      fill="white"
                    />
                  )}
                </div>

                <div
                  className={`text-sm leading-relaxed ${
                    isSelected ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  <p className="font-medium mb-1">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} - {addr.pinCode}
                  </p>
                  <p className="mt-2 font-medium">{addr.phone}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AddressSelection;
