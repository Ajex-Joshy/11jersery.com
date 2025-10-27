import UserLayout from "../layouts/UserLayout";
import Profile from "../features/user/account/profile";
import { Route, Routes } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { ProtectedRoutes } from "./ProtectedRoutes";
import LandingPage from "../features/user/landingPage/LandingPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>
      <Route
        path="/sign-in/*"
        element={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              background: "linear-gradient(135deg, #000000 0%, #434343 100%)",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              <SignIn routing="path" path="/sign-in" />
            </div>
          </div>
        }
      />
      <Route
        path="/sign-up/*"
        element={<SignUp routing="path" path="/sign-up" />}
      />

      <Route element={<ProtectedRoutes />}>
        <Route path="/account" element={<Profile />} />
        <Route path="/orders" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
