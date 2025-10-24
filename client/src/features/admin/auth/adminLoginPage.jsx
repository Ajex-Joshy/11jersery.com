import { useKeycloak } from "@react-keycloak/web";
import { Navigate } from "react-router-dom";

const AdminLoginPage = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  // If an admin is already logged in, send them to the dashboard.
  if (keycloak.authenticated && keycloak.hasRealmRole("admin")) {
    return <Navigate to="/admin/dashboard" />;
  }

  // If a non-admin user is logged in, send them to the user home page.
  if (keycloak.authenticated && !keycloak.hasRealmRole("admin")) {
    return <Navigate to="/" />;
  }

  // If not logged in, trigger the login flow.
  keycloak.login();

  return <div>Redirecting to login...</div>;
};

export default AdminLoginPage;
