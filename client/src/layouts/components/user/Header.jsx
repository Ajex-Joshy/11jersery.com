import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Heart, ShoppingCart, User, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectIsAuthenticated,
  openAuthModal,
} from "../../../features/user/account/authSlice.js";
import { useCart } from "../../../features/user/cart/cartHooks.js";
import { useWishlist } from "../../../features/user/wishlist/wishlistHooks.js";

const Header = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: cartPayload } = useCart();
  const cartItems = cartPayload?.data?.items?.length;
  const { data: wishlistPayload } = useWishlist();
  const whislistItems = wishlistPayload?.payload?.products?.length;

  const handleOpenLogin = () => dispatch(openAuthModal("login"));
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim())
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const renderProtectedIcon = (icon, path) =>
    isAuthenticated ? (
      <Link to={path}>{icon}</Link>
    ) : (
      <button onClick={handleOpenLogin}>{icon}</button>
    );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {isBannerVisible && (
        <div className="bg-black text-white text-xs text-center py-2 px-4 relative">
          <span>Get 20% off on your first order. Use code: 11NEW</span>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold">
            11jersey.com
          </Link>
          <div className="hidden md:flex gap-6 text-sm">
            <NavLink to="/">Club</NavLink>
            <NavLink to="/products?category=player-edition-jerseys">
              Player
            </NavLink>
            <NavLink to="/collections/national">National</NavLink>
            <NavLink to="/collections/limited">Limited Editions</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative hidden lg:block">
              <input
                className="bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm w-64"
                type="search"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </form>

          {renderProtectedIcon(
            <div className="relative">
              <Heart size={22} />
              {whislistItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center">
                  {whislistItems}
                </span>
              )}
            </div>,
            "/account/wishlist"
          )}

          {renderProtectedIcon(
            <div className="relative">
              <ShoppingCart size={22} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </div>,
            "/cart"
          )}
          {renderProtectedIcon(<User />, "/account")}
        </div>
      </nav>
    </header>
  );
};

export default Header;
