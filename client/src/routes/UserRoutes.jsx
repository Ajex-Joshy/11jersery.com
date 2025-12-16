import UserLayout from "../layouts/UserLayout";
import AccountLayout from "../layouts/AccountLayout";
import { Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
import { ProtectedRoutes } from "./ProtectedRoutes";
import ResetPasswordPage from "../features/user/account/components/ResetPasswordPage";

import * as Pages from "./UserLazyPages.js";
import { Loader2 } from "lucide-react";

const AppLoader = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 py-20 text-center">
      <Loader2 className="w-10 h-10 animate-spin text-gray-700 dark:text-gray-300" />
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
        Please wait while we prepare your experience…
      </p>
    </div>
  );
};

const UserRoutes = () => (
  <Suspense fallback={<AppLoader />}>
    <Routes>
      <Route element={<UserLayout />} errorElement={<Pages.ErrorPage />}>
        <Route path="/" element={<Pages.LandingPage />} />
        <Route path="/product/:slug" element={<Pages.ProductDetailsPage />} />
        <Route path="/products" element={<Pages.ProductListingPage />} />
        <Route path="/about-us" element={<Pages.AboutUsPage />} />
        <Route path="/our-story" element={<Pages.OurStoryPage />} />
        <Route
          path="/terms-and-conditions"
          element={<Pages.TermsAndConditionsPage />}
        />
        <Route path="/privacy-policy" element={<Pages.PrivacyPolicyPage />} />
      </Route>

      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/cart" element={<Pages.CartPage />} />
        <Route path="/checkout" element={<Pages.CheckoutPage />} />
        <Route path="/payment" element={<Pages.PaymentPage />} />
        <Route
          path="/order-confirmation/:orderId"
          element={<Pages.OrderConfirmationPage />}
        />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Pages.AccountOverview />} />
          <Route
            path="/account/settings"
            element={<Pages.AccountSettingsPage />}
          />
          <Route path="/account/addresses" element={<Pages.AddressesPage />} />
          <Route
            path="/account/addresses/new"
            element={<Pages.AddAddressPage />}
          />
          <Route path="/account/orders" element={<Pages.OrderHistoryPage />} />
          <Route path="/account/wallet" element={<Pages.WalletPage />} />
          <Route
            path="/account/orders/:orderId"
            element={<Pages.OrderDetailsPage />}
          />
          <Route
            path="/account/addresses/edit/:addressId"
            element={<Pages.AddAddressPage />}
          />
          <Route path="/account/wishlist" element={<Pages.WishlistPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Pages.NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default UserRoutes;
