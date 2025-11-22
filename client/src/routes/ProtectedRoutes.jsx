import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  openAuthModal,
  selectCurrentUser,
} from "../features/user/account/authSlice";

export const ProtectedRoutes = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  if (!user) {
    dispatch(openAuthModal("login"));
    return <Navigate to="/" replace />;
  }

  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
};
