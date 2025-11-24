import { lazy } from "react";

export const LandingPage = lazy(() =>
  import("../features/user/landingPage/LandingPage")
);
export const ProductDetailsPage = lazy(() =>
  import("../features/user/productPages/ProductDetailsPage")
);
export const ProductListingPage = lazy(() =>
  import("../features/user/productPages/ProductListingPage")
);
export const AboutUsPage = lazy(() =>
  import("../features/user/company/AboutUs")
);
export const OurStoryPage = lazy(() =>
  import("../features/user/company/OurStory")
);
export const TermsAndConditionsPage = lazy(() =>
  import("../features/user/company/TermsAndConditionsPage")
);
export const PrivacyPolicyPage = lazy(() =>
  import("../features/user/company/PrivacyPolicyPage")
);
export const NotFoundPage = lazy(() =>
  import("../features/user/company/NotFoundPage")
);
export const ErrorPage = lazy(() =>
  import("../features/user/company/ErrorPage")
);
export const CartPage = lazy(() => import("../features/user/cart/CartPage"));
export const CheckoutPage = lazy(() =>
  import("../features/user/checkout/CheckoutPage")
);
export const PaymentPage = lazy(() =>
  import("../features/user/checkout/PaymentPage")
);
export const AccountOverview = lazy(() =>
  import("../features/user/account/AccountOverview")
);
export const AccountSettingsPage = lazy(() =>
  import("../features/user/account/AccountSettings")
);
export const AddressesPage = lazy(() =>
  import("../features/user/address/AddressPage")
);
export const AddAddressPage = lazy(() =>
  import("../features/user/address/AddAddressPage")
);
export const OrderConfirmationPage = lazy(() =>
  import("../features/user/order/OrderConfirmationPage")
);
export const OrderHistoryPage = lazy(() =>
  import("../features/user/order/OrderHistoryPage")
);
export const OrderDetailsPage = lazy(() =>
  import("../features/user/order/OrderDetailsPage")
);
export const WalletPage = lazy(() =>
  import("../features/user/account/wallet/WalletPage")
);
