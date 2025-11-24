import {
  FiShoppingCart,
  FiUsers,
  FiTag,
  FiGrid,
  FiDollarSign,
  FiPlusCircle,
  FiList,
  FiUserCheck,
  FiInbox,
} from "react-icons/fi";
import { GoHome } from "react-icons/go";

export const sidebarSections = [
  {
    title: "Main menu",
    links: [
      { path: "/admin/dashboard", icon: GoHome, label: "Dashboard" },
      { path: "/admin/orders", icon: FiShoppingCart, label: "Orders" },
      { path: "/admin/customers", icon: FiUsers, label: "Customers" },
      { path: "/admin/coupons", icon: FiTag, label: "Coupons" },
      { path: "/admin/categories", icon: FiGrid, label: "Categories" },
      { path: "/admin/transactions", icon: FiDollarSign, label: "Transaction" },
    ],
  },
  {
    title: "Product",
    links: [
      { path: "/admin/add-product", icon: FiPlusCircle, label: "Add Products" },
      { path: "/admin/products", icon: FiList, label: "Product List" },
    ],
  },
  {
    title: "Admin",
    links: [
      { path: "/admin/profile", icon: FiUserCheck, label: "Admin role" },
      {
        path: "/admin/inbox",
        icon: FiInbox,
        label: "Inbox",
        showInboxBadge: true,
      },
    ],
  },
];
