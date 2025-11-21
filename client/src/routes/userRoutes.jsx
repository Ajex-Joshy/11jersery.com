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
import AccountSettingsPage from "../features/user/account/AccountSettings.jsx";
import CartPage from "../features/user/cart/CartPage.jsx";
import AddressesPage from "../features/user/address/AddressPage.jsx";
import AddAddressPage from "../features/user/address/AddAddressPage.jsx";
import CheckoutPage from "../features/user/checkout/CheckoutPage.jsx";
import PaymentPage from "../features/user/checkout/PaymentPage.jsx";
import OrderConfirmationPage from "../features/user/order/OrderConfirmationPage.jsx";
import OrderHistoryPage from "../features/user/order/OrderHistoryPage.jsx";
import OrderDetailsPage from "../features/user/order/OrderDetailsPage.jsx";

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
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmationPage />}
        />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<AccountOverview />} />
          <Route path="/account/settings" element={<AccountSettingsPage />} />
          <Route path="/account/addresses" element={<AddressesPage />} />
          <Route path="/account/addresses/new" element={<AddAddressPage />} />
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          <Route
            path="/account/orders/:orderId"
            element={<OrderDetailsPage />}
          />
          <Route
            path="/account/addresses/edit/:addressId"
            element={<AddAddressPage />}
          />
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
