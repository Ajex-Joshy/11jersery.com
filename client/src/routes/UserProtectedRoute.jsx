import { Outlet } from "react-router-dom";

const UserProtectedRoute = ({ children }) => {
  return <Outlet />;
};

export default UserProtectedRoute;
