import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/admin/Sidebar";
import { Toaster } from "react-hot-toast";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <Outlet />
        <Toaster position="top-right" />
      </main>
    </div>
  );
};

export default AdminLayout;
