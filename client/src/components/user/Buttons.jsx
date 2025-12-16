import React, { useState } from "react";
import PropTypes from "prop-types";
import { FileText, Loader2 } from "lucide-react";
import { useDownloadInvoice } from "../../features/user/order/orderHooks";

const InvoiceDownloadButton = ({
  order,
  className = "",
  variant = "default",
}) => {
  const { mutate: download, isLoading } = useDownloadInvoice();
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    download(order, {
      onSuccess: () => {
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
      },
    });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={`text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100 ${className}`}
        title="Download Invoice"
        aria-label="Download Invoice"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <FileText size={18} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 
        text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200
        disabled:opacity-50 disabled:cursor-not-allowed ${className}
      `}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <FileText size={16} />
      )}
      {isLoading
        ? "Downloading..."
        : downloaded
        ? "Downloaded"
        : "Download Invoice"}
    </button>
  );
};

InvoiceDownloadButton.propTypes = {
  order: PropTypes.object.isRequired,
  className: PropTypes.string,
  variant: PropTypes.string,
};

export default InvoiceDownloadButton;
