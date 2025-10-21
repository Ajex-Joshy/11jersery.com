import { Route, Routes } from "react-router-dom";
import AdminLogin from "../pages/admin/adminLogin";

const AdminRoutes = () => (
  <Routes>
    <Route path="/login" element={<AdminLogin />} />
  </Routes>
);

export default AdminRoutes;
