import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>;
  }

  const handleLogin = () => keycloak.login();
  const handleLogout = () => keycloak.logout();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div style={{ marginBottom: "20px" }}>
        {!keycloak.authenticated ? (
          <button
            onClick={handleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/39/Keycloak_logo.svg"
              alt="Keycloak Logo"
              style={{ width: "24px", height: "24px" }}
            />
            Login with Keycloak
          </button>
        ) : (
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/39/Keycloak_logo.svg"
              alt="Keycloak Logo"
              style={{ width: "24px", height: "24px" }}
            />
            Logout
          </button>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default UserLayout;
