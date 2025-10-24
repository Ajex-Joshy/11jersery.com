import { useKeycloak } from "@react-keycloak/web";
import React from "react";

const Dashboard = () => {
  const { keycloak, initialized } = useKeycloak();
  if (!initialized) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={() => keycloak.logout()}
        style={{
          padding: "8px 16px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
