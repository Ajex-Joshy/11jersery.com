import { useKeycloak } from "@react-keycloak/web";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

const UserProtectedRoute = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  const isLoggedIn = keycloak.authenticated;

  useEffect(() => {
    // We want to redirect only after keycloak is initialized and
    // the user is not authenticated.
    if (initialized && !isLoggedIn) {
      keycloak.login();
    }
  }, [initialized, isLoggedIn, keycloak]);

  // Show a loading message while Keycloak is initializing
  if (!initialized) {
    return <div>Loading...</div>;
  }

  // If authenticated, render the children (the protected page).
  // Otherwise, show a redirecting message.
  return isLoggedIn ? <Outlet /> : <div>Redirecting to login...</div>;
};

export default UserProtectedRoute;
