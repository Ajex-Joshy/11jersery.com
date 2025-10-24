import { useKeycloak } from "@react-keycloak/web";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  // If user is already logged in, send them to the home page.
  if (keycloak.authenticated) {
    return <Navigate to="/" />;
  }

  // If not logged in, trigger the login flow.
  // The component will re-render, but the redirect will happen.
  keycloak.login();

  return <div>Redirecting to login...</div>;
};

export default LoginPage;
