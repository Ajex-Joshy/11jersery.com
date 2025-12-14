import { lazy } from "react";

export const AdminLoginPage = lazy(() =>
  import("../features/admin/auth/adminLoginPage")
);
export const Dashboard = lazy(() =>
  import("../features/admin/dashboard/Dashboard")
);
export const CustomerManagement = lazy(() =>
  import("../features/admin/customerManagement/CustomerManagement")
);
export const CategoryManagement = lazy(() =>
  import("../features/admin/categoryManagement/CategoryManagement")
);
export const AddCategory = lazy(() =>
  import("../features/admin/categoryManagement/AddCategory")
);
export const ProductManagement = lazy(() =>
  import("../features/admin/productManagement/ProductManagement")
);
export const AddProduct = lazy(() =>
  import("../features/admin/productManagement/AddProduct")
);
export const EditCategory = lazy(() =>
  import("../features/admin/categoryManagement/EditCategory")
);
export const Profile = lazy(() => import("../features/admin/account/Profile"));
export const Admin404 = lazy(() => import("../components/admin/404"));
export const EditProduct = lazy(() =>
  import("../features/admin/productManagement/EditProduct")
);
export const ErrorPage = lazy(() =>
  import("../features/user/company/ErrorPage")
);
export const OrderManagement = lazy(() =>
  import("../features/admin/order/OrderManagement")
);
export const AdminOrderDetails = lazy(() =>
  import("../features/admin/order/AdminOrderDetails")
);
export const Inbox = lazy(() => import("../features/admin/order/Inbox"));
