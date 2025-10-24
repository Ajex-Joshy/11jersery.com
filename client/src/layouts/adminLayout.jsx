// client/src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom"; // Outlet renders the matched child route component
import Sidebar from "./components/admin/Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* Page Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
