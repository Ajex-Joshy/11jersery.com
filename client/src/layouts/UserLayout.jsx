import { Outlet, useSearchParams } from "react-router-dom";
import Header from "./components/user/Header";
import Footer from "./components/user/Footer";
import AuthModal from "../features/user/account/components/AuthModal";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { openAuthModal } from "../features/user/account/authSlice";

const UserLayout = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    if (referralCode) {
      localStorage.setItem("referral-code", referralCode);
      dispatch(openAuthModal("signup"));
    }
  }, [dispatch, searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <Toaster position="top-right" />
    </div>
  );
};

export default UserLayout;
