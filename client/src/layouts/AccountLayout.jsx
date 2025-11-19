import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOut } from "../features/user/account/authSlice";
import {
  User,
  Package,
  Heart,
  MapPin,
  Wallet,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";

const navLinks = [
  { name: "Account Overview", href: "/account", icon: User, end: true },
  { name: "My orders", href: "orders", icon: Package },
  { name: "Wishlist", href: "wishlist", icon: Heart },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Wallet", href: "wallet", icon: Wallet },
  { name: "My Coupons", href: "coupons", icon: Ticket },
  { name: "Account Settings", href: "settings", icon: Settings },
];

// eslint-disable-next-line no-unused-vars
const AccountNavLink = ({ href, icon: Icon, children, end = false }) => {
  const activeClass = "bg-black text-white font-semibold";
  const inactiveClass =
    "text-black font-semibold hover:bg-white hover:text-black";

  return (
    <li>
      <NavLink
        to={href}
        end={end}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
            isActive ? activeClass : inactiveClass
          }`
        }
      >
        <Icon size={18} />
        <span>{children}</span>
      </NavLink>
    </li>
  );
};

/**
 * The main AccountLayout component with sidebar and content outlet.
 */
const AccountLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logOut());

    navigate("/");
  };

  return (
    <div className="container ">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 ">
        {/* --- Sidebar Column --- */}
        <aside className="lg:col-span-1 bg-stone-200 p-8">
          <nav className="flex flex-col">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <AccountNavLink
                  key={link.name}
                  href={link.href}
                  icon={link.icon}
                  end={link.end}
                >
                  {link.name}
                </AccountNavLink>
              ))}
            </ul>

            {/* --- Logout Button --- */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full text-gray-600 hover:bg-white hover:text-red-600 font-medium transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>LOGOUT</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* --- Content Column --- */}
        <main className="lg:col-span-3 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
