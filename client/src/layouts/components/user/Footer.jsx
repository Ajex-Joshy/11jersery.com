import { Link } from "react-router-dom";
import { Mail, Twitter, Facebook, Instagram, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-stone-200">
      <div className="bg-black text-white py-6 rounded-lg my-12 w-[80%] px-14 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Get exclusive access to new arrivals <br /> and limited‑edition
            drops by following our social handles.
          </h2>
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
