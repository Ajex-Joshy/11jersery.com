import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";
import AxiosInterceptor from "./api/AxiosInterceptor.jsx";

// 1. Initialize the Keycloak instance
const keycloak = new Keycloak({
  url: "http://localhost:8080/", // Your Keycloak server URL
  realm: "11jersey.com", // Your Realm name
  clientId: "11jersey.com-frontend", // Your Frontend Client ID
});
// move this to env

// 2. Define the init options
const initOptions = {
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReactKeycloakProvider authClient={keycloak} initOptions={initOptions}>
      <AxiosInterceptor>
        <App />
      </AxiosInterceptor>
    </ReactKeycloakProvider>
  </StrictMode>
);
