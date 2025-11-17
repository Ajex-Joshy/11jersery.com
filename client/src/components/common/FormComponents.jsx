import React from "react";
import PropTypes from "prop-types";

export const FormInput = ({ id, label, error, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      className={`border p-3 rounded-md text-sm ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-500" // Error styles
          : "border-gray-300 focus:border-black focus:ring-black" // Default styles
      } focus:outline-none focus:ring-1`} // Focus styles
      {...props}
    />
    {error && <span className="text-red-600 text-xs mt-1">{error}</span>}
  </div>
);

FormInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export const FormTextarea = ({ label, id, error, ...props }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      className={`border p-2 rounded-md ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...props} // Spreads other props like rows, placeholder, register, etc.
    />
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);
FormTextarea.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
};
