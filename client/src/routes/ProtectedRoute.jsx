import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ loginPath = "/login" }) => {
  const token = localStorage.getItem("adminToken");

  // If token exists, render the nested routes
  // Otherwise, redirect to login page
  return token ? <Outlet /> : <Navigate to={loginPath} replace />;
};

export default ProtectedRoute;
