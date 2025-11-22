import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminLoginPage from "../features/admin/auth/adminLoginPage";
import Dashboard from "../features/admin/dashboard/Dashboard";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/adminLayout";
import CustomerManagement from "../features/admin/customerManagement/CustomerManagement";
import CategoryManagement from "../features/admin/categoryManagement/CategoryManagement";
import AddCategory from "../features/admin/categoryManagement/AddCategory";
import ProductManagement from "../features/admin/productManagement/ProductManagement";
import AddProduct from "../features/admin/productManagement/AddProduct";
import EditCategory from "../features/admin/categoryManagement/EditCategory";
import Profile from "../features/admin/account/Profile";
import Admin404 from "../components/admin/404";
import EditProduct from "../features/admin/productManagement/EditProduct";
import ErrorPage from "../features/user/company/ErrorPage";
import OrderManagement from "../features/admin/order/OrderManagement";
import AdminOrderDetails from "../features/admin/order/AdminOrderDetails";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<AdminLoginPage />}
        errorElement={<ErrorPage />}
      />
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/edit-category/:slug" element={<EditCategory />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-product/:slug" element={<EditProduct />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/orders/:orderId" element={<AdminOrderDetails />} />
          {/* 
          <Route path="/orders" element={<OrderMangement />} />
          <Route path="/categories" element={<CategoryManagement />} />
          <Route path="/transactions" element={<TransactionManagement />} />
          <Route path="/coupons" element={<CouponManagement />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/inbox" element={<Inbox />} /> */}
        </Route>
        <Route path="*" element={<Admin404 />} />
      </Route>
      <Route path="*" element={<Admin404 />} />
    </Routes>
  );
};

export default AdminRoutes;
