import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../layouts/adminLayout";
import * as Pages from "./adminLazyPages";

const AdminRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route
          path="/login"
          element={<Pages.AdminLoginPage />}
          errorElement={<Pages.ErrorPage />}
        />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Pages.Dashboard />} />
            <Route path="/customers" element={<Pages.CustomerManagement />} />
            <Route path="/categories" element={<Pages.CategoryManagement />} />
            <Route path="/add-category" element={<Pages.AddCategory />} />
            <Route
              path="/edit-category/:slug"
              element={<Pages.EditCategory />}
            />
            <Route path="/products" element={<Pages.ProductManagement />} />
            <Route path="/add-product" element={<Pages.AddProduct />} />
            <Route path="/profile" element={<Pages.Profile />} />
            <Route path="/edit-product/:slug" element={<Pages.EditProduct />} />
            <Route path="/orders" element={<Pages.OrderManagement />} />
            <Route
              path="/orders/:orderId"
              element={<Pages.AdminOrderDetails />}
            />
            <Route path="/inbox" element={<Pages.Inbox />} />
          </Route>
          <Route path="*" element={<Pages.Admin404 />} />
        </Route>
        <Route path="*" element={<Pages.Admin404 />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
