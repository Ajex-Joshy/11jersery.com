import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchX, Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12">
      <SearchX className="w-24 h-24 text-gray-300 mb-4" strokeWidth={1} />

      <span className="text-6xl font-bold text-gray-800">404</span>

      <h1 className="text-2xl font-semibold text-gray-900 mt-4 mb-2">
        Page Not Found
      </h1>

      <p className="text-gray-600 max-w-sm mb-8">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)} // Go back one step
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          <ArrowLeft size={18} />
          Go Back
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

export default NotFoundPage;
