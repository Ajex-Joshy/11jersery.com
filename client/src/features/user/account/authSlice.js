import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// --- Initial State ---
const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  isAuthModalOpen: false,
  authModalView: "login",
};

// --- Create Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      console.log("SET USER:", user);
      state.user = user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      state.isAuthModalOpen = false;
      if (user) {
        toast.success(`Welcome back, ${user.firstName || "User"}!`);
      }
    },
    logOut: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      state.user = null;
      toast.success("Logged out successfully.");
    },
    // Actions for modal control
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.authModalView = action.payload || "login";
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    setAuthModalView: (state, action) => {
      state.authModalView = action.payload;
    },
    // Action to check auth status on load (can be dispatched from App.jsx)
    checkAuth: (state) => {
      const storedUser = localStorage.getItem("user");
      state.user = storedUser ? JSON.parse(storedUser) : null;
    },
  },
});

// Export actions
export const {
  setUser,
  logOut,
  openAuthModal,
  closeAuthModal,
  setAuthModalView,
  checkAuth,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Export selectors (optional but good practice)
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectIsAuthModalOpen = (state) => state.auth.isAuthModalOpen;
export const selectAuthModalView = (state) => state.auth.authModalView;
export const selectIsAuthenticated = (state) => state.auth.user;
