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
import ProductListingPage from "../features/user/productPages/ProductListingPage.jsx";
import AboutUsPage from "../features/user/company/AboutUs.jsx";
import OurStoryPage from "../features/user/company/OurStory.jsx";
import TermsAndConditionsPage from "../features/user/company/TermsAndConditionsPage.jsx";
import PrivacyPolicyPage from "../features/user/company/PrivacyPolicyPage.jsx";
import NotFoundPage from "../features/user/company/NotFoundPage.jsx";
import ErrorPage from "../features/user/company/ErrorPage.jsx";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />} errorElement={<ErrorPage />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/product/:slug" element={<ProductDetailsPage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditionsPage />}
        />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default UserRoutes;
