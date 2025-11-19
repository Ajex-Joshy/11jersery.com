import React from "react";
import { Navigate } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  openAuthModal,
  selectCurrentUser,
} from "../features/user/account/authSlice";

export const ProtectedRoutes = (path, icon) => {
  // const isAuthenticated = useSelector(selectCurrentUser);
  // const dispatch = useDispatch();
  // const handleOpenLogin = () => {
  //   dispatch(openAuthModal("login"));
  // };

  // if (isAuthenticated) {
  //   return <Link to={path}>{icon}</Link>;
  // }
  // return (
  //   <button onClick={handleOpenLogin} className="...">
  //     {icon}
  //   </button>
  // );

  return <UserLayout />;
};
