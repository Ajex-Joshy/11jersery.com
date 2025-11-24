import UserLayout from "../layouts/UserLayout";
import AccountLayout from "../layouts/AccountLayout";
import { Route, Routes } from "react-router-dom";
import React, { Suspense } from "react";
import { ProtectedRoutes } from "./ProtectedRoutes";
import ResetPasswordPage from "../features/user/account/components/ResetPasswordPage";

import * as Pages from "./userLazyPages";

const UserRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
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
        </Route>
      </Route>

      <Route path="*" element={<Pages.NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default UserRoutes;
