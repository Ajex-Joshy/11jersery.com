import { useKeycloak } from "@react-keycloak/web";
import { Navigate, Outlet } from "react-router-dom"; // Import Outlet

const AdminProtectedRoute = () => {
  const { keycloak, initialized } = useKeycloak();

  // Wait for Keycloak to be initialized
  if (!initialized) {
    return <div>Loading...</div>; // Or a spinner component
  }

  const isAuthed = keycloak.authenticated;
  const isAdmin = keycloak.hasRealmRole("admin");

  // If they are logged in and an admin, render the nested routes
  // (which is your <AdminLayout />)
  // Otherwise, navigate them to the home page.
  return isAuthed && isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default AdminProtectedRoute;
