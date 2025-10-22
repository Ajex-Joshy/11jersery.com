import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/dashboard";
import ProtectedRoute from "./ProtectedRoute";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        element={
          <ProtectedRoute tokenKey="adminToken" loginPath="/admin/login" />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
