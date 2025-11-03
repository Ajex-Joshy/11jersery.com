import React, { useState } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  X,
  Mail,
  Twitter,
  Facebook,
  Instagram,
  Github,
  LogOut,
} from "lucide-react";
import AuthModal from "../features/user/account/components/AuthModal";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  logOut,
  openAuthModal,
} from "../features/user/account/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

// --- Header Component ---
const Header = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // Get the navigate function

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleOpenLogin = () => {
    dispatch(openAuthModal("login")); // Dispatch open modal action
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top Banner */}
      {isBannerVisible && (
        <div className="bg-black text-white text-xs text-center py-2 px-4 relative">
          <span>Get 20% off on your first order. Use code: 11NEW</span>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white hover:text-gray-300"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Main Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            11jersey.com
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-black" : "hover:text-black"
              }
            >
              Club
            </NavLink>
            <NavLink
              to="/products?category=player-edition-jerseys"
              className={({ isActive }) =>
                isActive ? "text-black" : "hover:text-black"
              }
            >
              Player
            </NavLink>
            <NavLink
              to="/collections/national"
              className={({ isActive }) =>
                isActive ? "text-black" : "hover:text-black"
              }
            >
              National
            </NavLink>
            <NavLink
              to="/collections/limited"
              className={({ isActive }) =>
                isActive ? "text-black" : "hover:text-black"
              }
            >
              Limited Editions
            </NavLink>
          </div>
        </div>

        {/* Search and Icons */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit}>
            <div className="relative hidden lg:block">
              <input
                type="search"
                placeholder="Search for products..."
                className="bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-gray-300"
                // --- 5. Connect input to React state ---
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </form>

          {/* Icons */}
          <Link to="/wishlist" className="text-gray-600 hover:text-black">
            <Heart size={22} />
          </Link>
          <Link to="/cart" className="text-gray-600 hover:text-black relative">
            <ShoppingCart size={22} />
            {/* Add badge if cart has items */}
            {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span> */}
          </Link>
          {isAuthenticated ? (
            <div className="relative group">
              <Link to="/account" className="...">
                {" "}
                <User />{" "}
              </Link>
            </div>
          ) : (
            <button onClick={handleOpenLogin} className="...">
              {" "}
              <User />{" "}
            </button>
          )}
          {/* Mobile Menu Button - Placeholder */}
          <button className="md:hidden text-gray-600 hover:text-black">
            {/* Add Menu icon here */}
          </button>
        </div>
      </nav>
    </header>
  );
};

// --- Footer Component ---
const Footer = () => {
  return (
    <footer className=" bg-stone-200 ">
      {/* Newsletter Section */}
      <div className="bg-black text-white py-6 rounded-lg my-12 w-[80%] px-14 mx-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            Get exclusive access, new
            <br /> arrivals, and limited editions
          </h2>
          <form className="w-full max-w-md space-y-3">
            <div className="relative bg-white rounded-4xl">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full p-3 pl-10 rounded-full border-0 text-gray-900 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition text-sm"
            >
              Join the Club
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full py-12 flex flex-col p-8 md:flex-row md:justify-around bg-stone-200">
        {/* Brand & Social */}
        <div className="md:col-span-1">
          <h3 className="text-xl font-bold mb-3">11jersey.com</h3>
          <p className="text-sm text-gray-600 mb-4">
            Wear Your Passion. Play Your Heart.
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              className="text-gray-500 hover:text-black p-2 bg-gray-100 rounded-full"
            >
              <Twitter size={16} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-black p-2 bg-gray-100 rounded-full"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-black p-2 bg-gray-100 rounded-full"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-black p-2 bg-gray-100 rounded-full"
            >
              <Github size={16} />
            </a>
          </div>
        </div>

        {/* Link Columns */}
        <div>
          <h4 className="font-semibold mb-4 text-gray-800">COMPANY</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/about-us" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/our-story" className="hover:underline">
                Our Story
              </Link>
            </li>
            {/* Add more company links */}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-800">HELP</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/terms-and-conditions" className="hover:underline">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            {/* Add more help links */}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-gray-800">LINKS</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="/account" className="hover:underline">
                Account
              </Link>
            </li>
            <li>
              <Link to="/account/wallet" className="hover:underline">
                Wallet
              </Link>
            </li>
            <li>
              <Link to="/account/orders" className="hover:underline">
                Orders
              </Link>
            </li>
            {/* Add more useful links */}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-stone-200 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} 11jersey.com All Rights Reserved
          </p>
          {/* Placeholder for Payment Icons */}
          <div className="flex gap-2 mt-4 md:mt-0">
            {/* Replace with actual image elements */}
            <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">
              VISA
            </div>
            <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">
              MC
            </div>
            <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">
              PayPal
            </div>
            <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">
              GPay
            </div>
            <div className="h-6 w-10 bg-gray-300 rounded flex items-center justify-center text-[8px]">
              APay
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- UserLayout Component ---
const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Content of specific pages will be rendered here */}
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <Toaster position="top-right" />
    </div>
  );
};

export default UserLayout;
