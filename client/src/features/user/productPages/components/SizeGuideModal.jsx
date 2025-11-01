import React from "react";
import { X } from "lucide-react";

// This data is more logical than the sample image and can be easily edited.
const sizeData = [
  { size: "XS", chest: "81 - 88", waist: "68 - 75", hip: "80 - 87" },
  { size: "S", chest: "89 - 96", waist: "76 - 83", hip: "88 - 95" },
  { size: "M", chest: "97 - 104", waist: "84 - 91", hip: "96 - 103" },
  { size: "L", chest: "105 - 112", waist: "92 - 99", hip: "104 - 111" },
  { size: "XL", chest: "113 - 120", waist: "100 - 107", hip: "112 - 119" },
  { size: "XXL", chest: "121 - 128", waist: "108 - 115", hip: "120 - 127" },
];

const SizeGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Modal Panel */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Body Measurements (cm)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Size Chart Table) */}
        <div className="p-4 md:p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700 uppercase">
                    Size
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 uppercase">
                    Chest
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 uppercase">
                    Waist
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 uppercase">
                    Low Hip
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sizeData.map((row) => (
                  <tr key={row.size} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.size}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.chest}</td>
                    <td className="px-4 py-3 text-gray-600">{row.waist}</td>
                    <td className="px-4 py-3 text-gray-600">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
