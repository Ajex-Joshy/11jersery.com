import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import PropTypes from "prop-types";

/**
 * A reusable loading spinner component.
 */
export const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center p-12">
    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
    <span className="text-sm text-gray-500">{text}</span>
  </div>
);

/**
 * A reusable error message component.
 */
export const ErrorDisplay = ({ error }) => {
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    "An unknown error occurred.";
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
      <h3 className="text-lg font-semibold text-red-700">
        Oops! Something went wrong
      </h3>
      <p className="text-sm text-red-600">{errorMessage}</p>
    </div>
  );
};

ErrorDisplay.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.shape({
      response: PropTypes.shape({
        data: PropTypes.shape({
          message: PropTypes.string,
        }),
      }),
      message: PropTypes.string,
    }),
    PropTypes.string,
  ]),
};
