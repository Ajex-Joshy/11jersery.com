import React from "react";
import { NavLink } from "react-router-dom";
import { GoHome } from "react-icons/go";
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
  FiExternalLink,
} from "react-icons/fi";
import { useSelector } from "react-redux";

// Define links with sections
const sidebarSections = [
  {
    title: "Main menu",
    links: [
      { path: "/admin/dashboard", icon: GoHome, label: "Dashboard" },
      {
        path: "/admin/orders",
        icon: FiShoppingCart,
        label: "Order Management",
      },
      { path: "/admin/customers", icon: FiUsers, label: "Customers" },
      { path: "/admin/coupons", icon: FiTag, label: "Coupons" },
      { path: "/admin/categories", icon: FiGrid, label: "Categories" },
      { path: "/admin/transactions", icon: FiDollarSign, label: "Transaction" },
    ],
  },
  {
    title: "Product",
    links: [
      {
        path: "/admin/add-product",
        icon: FiPlusCircle,
        label: "Add Products",
      },
      { path: "/admin/products", icon: FiList, label: "Product List" },
    ],
  },
  {
    title: "Admin",
    links: [
      { path: "/admin/profile", icon: FiUserCheck, label: "Admin role" },
      { path: "/admin/inbox", icon: FiInbox, label: "Inbox" },
    ],
  },
];

const Sidebar = () => {
  const admin = useSelector((store) => store.admin.admin);
  // Classes for NavLink state based on the image
  const getNavLinkClass = ({ isActive }) =>
    `group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
      isActive
        ? "bg-black text-white" // Active link style
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Inactive link style
    }`;

  return (
    <div className="w-64 bg-white text-gray-800 flex flex-col h-screen border-r border-gray-200 flex-shrink-0">
      <div className="h-16 flex items-center justify-start pl-6 text-xl font-bold border-b border-gray-200 flex-shrink-0">
        11jersey.com
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {sidebarSections.map((section) => (
          <div key={section.title}>
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={getNavLinkClass}
                  end={link.path === "/admin/dashboard"}
                >
                  <link.icon
                    className={`mr-3 h-5 w-5 ${
                      link.path === "/admin/customers"
                        ? ""
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <img
            className="h-10 w-10 rounded-full"
            src={`https://placehold.co/40x40/black/white?text=${admin.firstName[0]}`}
            alt="Admin Avatar"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{`${admin.firstName} ${admin.lastName}`}</p>
            <p className="text-xs text-gray-500 truncate">{admin.email}</p>
          </div>
        </div>
        {/* Visit Store Link */}
        <a
          href="/" // Change to actual store URL
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md border border-gray-200 transition-colors duration-150"
        >
          <span className="flex items-center">
            {/* Replace with a store/gallery icon if you have one */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Visit store
          </span>
          <FiExternalLink
            className="h-4 w-4 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
