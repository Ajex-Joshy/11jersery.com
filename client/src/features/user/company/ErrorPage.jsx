import React from "react";
import { useRouteError, Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Home, RotateCw } from "lucide-react";

const ErrorPage = () => {
  const error = useRouteError(); // This hook gets the error
  const navigate = useNavigate();

  const errorMessage =
    error?.statusText || error?.message || "An unexpected error occurred.";
  const errorStatus = error?.status || "Error";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12">
      <AlertTriangle className="w-24 h-24 text-red-400 mb-4" strokeWidth={1} />

      <span className="text-6xl font-bold text-red-500">{errorStatus}</span>

      <h1 className="text-2xl font-semibold text-gray-900 mt-4 mb-2">
        Oops! Something went wrong.
      </h1>

      <p className="text-gray-600 max-w-sm mb-8">{errorMessage}</p>

      {/* Optional: Show stack trace in development */}
      {import.meta.env.DEV && (
        <pre className="text-left bg-gray-100 p-4 rounded-md text-xs text-red-700 overflow-auto max-w-lg">
          {error?.stack || JSON.stringify(error, null, 2)}
        </pre>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={() => navigate(0)} // Refresh the page
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          <RotateCw size={18} />
          Refresh Page
        </button>
        <Link
          to="/" // Go to Homepage
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition"
        >
          <Home size={18} />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
