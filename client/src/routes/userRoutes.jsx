import UserLayout from "../layouts/UserLayout";
import LandingPage from "../features/user/home/LandingPage";
import Profile from "../features/user/account/profile";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../features/user/auth/LoginPage";
import UserProtectedRoute from "./UserProtectedRoute";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LandingPage />} />

      <Route element={<UserProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/account" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default UserRoutes;
