import React from "react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { useSelector } from "react-redux";
import { sidebarSections } from "../../../utils/constants/admins/adminSidebarLinks";
import { useAdminReturnRequests } from "../../../features/admin/order/orderHooks";

const useInboxNotification = () => {
  const { data: payload } = useAdminReturnRequests();
  return payload?.data?.pagination?.totalRequests || 0;
};

const Sidebar = () => {
  const admin = useSelector((store) => store.admin.admin);
  const requests = useInboxNotification();

  const getNavLinkClass = ({ isActive }) =>
    `group flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="w-64 bg-white flex flex-col h-screen border-r">
      <div className="h-16 flex items-center pl-6 text-xl font-bold border-b">
        11jersey.com
      </div>

      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {sidebarSections.map(({ title, links }) => (
          <div key={title}>
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              {title}
            </h3>
            <div className="space-y-1">
              {links.map(({ path, icon: Icon, label, showInboxBadge }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={getNavLinkClass}
                  end={path === "/admin/dashboard"}
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  <span className="relative flex items-center">
                    {label}
                    {showInboxBadge && requests > 0 && (
                      <span className="ml-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
                        {requests}
                      </span>
                    )}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <img
            className="h-10 w-10 rounded-full"
            src={`https://placehold.co/40x40/black/white?text=${admin?.firstName?.[0]}`}
            alt="Admin Avatar"
          />
          <div>
            <p className="text-sm font-medium">{`${admin?.firstName} ${admin?.lastName}`}</p>
            <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md border"
        >
          <span className="flex items-center">Visit store</span>
          <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
