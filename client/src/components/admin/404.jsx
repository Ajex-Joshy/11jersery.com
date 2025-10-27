import React from "react";
import { useNavigate } from "react-router-dom";

const Admin404 = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-50 text-gray-800 font-sans">
      <h1 className="text-8xl font-bold m-0">404</h1>
      <p className="text-xl mt-4 mb-8 text-gray-600">Page Not Found</p>
      <button
        className="px-8 py-3 text-base bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors duration-300"
        onClick={() => navigate("/admin/login")}
      >
        Go Back to Dashboard
      </button>
    </div>
  );
};

export default Admin404;
