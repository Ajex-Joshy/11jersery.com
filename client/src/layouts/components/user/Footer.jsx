import { Link } from "react-router-dom";
import { Mail, Twitter, Facebook, Instagram, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-stone-200">
      <div className="bg-black text-white py-6 rounded-lg my-12 w-[80%] px-14 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Get exclusive access, new <br /> arrivals, and limited editions
          </h2>

          <form className="w-full max-w-md">
            <div className="relative bg-white rounded-4xl">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full p-3 pl-10 rounded-full"
              />
            </div>
            <button className="w-full bg-white text-black px-6 py-3 rounded-full mt-3 font-semibold">
              Join the Club
            </button>
          </form>
        </div>
      </div>

      <div className="w-full py-12 p-8 flex flex-col md:flex-row justify-around">
        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">COMPANY</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about-us">About Us</Link>
            </li>
            <li>
              <Link to="/our-story">Our Story</Link>
            </li>
          </ul>
        </div>
        {/* Help */}
        <div>
          <h4 className="font-semibold mb-4">HELP</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/terms-and-conditions">Terms & Conditions</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
        {/* Shortcuts */}
        <div>
          <h4 className="font-semibold mb-4">LINKS</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/account">Account</Link>
            </li>
            <li>
              <Link to="/account/wallet">Wallet</Link>
            </li>
            <li>
              <Link to="/account/orders">Orders</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="py-6 text-sm text-gray-500 flex justify-between px-6">
        <p>
          &copy; {new Date().getFullYear()} 11jersey.com All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
