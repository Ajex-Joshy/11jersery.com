import { Outlet } from "react-router-dom";
import Header from "./components/user/Header";
import Footer from "./components/user/Footer";
import AuthModal from "../features/user/account/components/AuthModal";
import { Toaster } from "react-hot-toast";

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <Toaster position="top-right" />
    </div>
  );
};

export default UserLayout;
