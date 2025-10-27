import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";

export const ProtectedRoutes = () => {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for Clerk to load to check auth status
  if (!isLoaded) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <UserLayout />;
};
