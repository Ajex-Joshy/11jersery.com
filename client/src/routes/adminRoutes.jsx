import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLoginPage from "../features/admin/auth/adminLoginPage";
import Dashboard from "../features/admin/dashboard/Dashboard";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/adminLayout";
import CustomerManagement from "../features/admin/customerManagement/CustomerManagement";
import CategoryManagement from "../features/admin/categoryManagement/CategoryManagement";
import AddCategory from "../features/admin/categoryManagement/AddCategory";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/add-category" element={<AddCategory />} />
          {/* 
          <Route path="/orders" element={<OrderMangement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/transactions" element={<TransactionManagement />} />
          <Route path="/coupons" element={<CouponManagement />} />
          <Route path="/add-product" element={<AddProducts />} />
          <Route path="/products" element={<ProductMangement />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/inbox" element={<Inbox />} /> */}
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
