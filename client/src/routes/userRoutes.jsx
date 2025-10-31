import UserLayout from "../layouts/UserLayout";
import { Route, Routes } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { ProtectedRoutes } from "./ProtectedRoutes";
import LandingPage from "../features/user/landingPage/LandingPage";
import ProductOverview from "../features/user/productPages/ProductDetailsPage";
import ProductDetailsPage from "../features/user/productPages/ProductDetailsPage";
import ResetPasswordPage from "../features/user/account/components/ResetPasswordPage.jsx";
import ForgotPasswordForm from "../features/user/account/components/ForgotPasswordForm.jsx";
import AccountLayout from "../layouts/AccountLayout.jsx";
import AccountOverview from "../features/user/account/AccountOverview.jsx";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
      </Route>
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/account" element={<AccountLayout />}>
          {/* 'index' is the default page for "/account" */}
          <Route index element={<AccountOverview />} />
          {/* <Route path="orders" element={<OrderHistory />} />
            <Route path="wishlist" element={<Wishlist />} />
           <Route path="addresses" element={<Addresses />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="settings" element={<AccountSettings />} />
            */}
        </Route>
      </Route>
    </Routes>
  );
};

export default UserRoutes;
