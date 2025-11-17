import React from "react";
import { Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";

export const ProtectedRoutes = () => {
  return <UserLayout />;
};
