import { AlertTriangle, Info, X } from "lucide-react";

const FeeWarningModal = ({ isOpen, onClose, onProceed }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200 border border-white/20">
        {/* Header with Amber Warning Theme */}
        <div className="bg-amber-50 p-5 border-b border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0 mt-0.5">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 leading-tight">
              Order Value Update
            </h3>
            <p className="text-amber-700/80 text-xs mt-1 font-medium uppercase tracking-wide">
              Action Required
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-amber-700/60 hover:bg-amber-100 hover:text-amber-800 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <p className="text-gray-600 leading-relaxed text-base">
            Cancelling this item will reduce your total order value below{" "}
            <span className="font-bold text-gray-900">₹500</span>.
          </p>

          {/* Detailed Info Box */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900">
                Delivery Fee Applicable
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                A standard delivery fee of{" "}
                <span className="font-bold">₹80</span> will be added to the
                remaining items in your order.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 font-semibold text-sm hover:bg-gray-200 rounded-lg transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onProceed}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 hover:shadow-md active:scale-95"
          >
            I Understand, Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeeWarningModal;
