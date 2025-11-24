import { NavLink } from "react-router-dom";

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

export default AccountNavLink;
