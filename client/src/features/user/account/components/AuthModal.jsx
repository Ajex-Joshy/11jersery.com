import React from "react";
import { X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux"; // Import RTK hooks
import {
  closeAuthModal,
  selectIsAuthModalOpen,
  selectAuthModalView,
} from "../authSlice";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

const AuthModal = () => {
  // Read state using selectors
  const isAuthModalOpen = useSelector(selectIsAuthModalOpen);
  const authModalView = useSelector(selectAuthModalView);
  const dispatch = useDispatch();

  if (!isAuthModalOpen) {
    return null;
  }

  const handleClose = () => {
    dispatch(closeAuthModal());
  };
  const renderForm = () => {
    switch (authModalView) {
      case "login":
        return <LoginForm />;
      case "signup":
        return <SignupForm />;
      case "forgotPassword":
        return <ForgotPasswordForm />; // 2. Add case
      default:
        return <LoginForm />;
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md m-4 transform transition-all duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="..." aria-label="Close modal">
          <X />
        </button>
        {renderForm()}
      </div>
    </div>
  );
};

export default AuthModal;
