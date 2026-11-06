import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, mustChangePassword } from "../services/api";

// Pages that need a signed-in admin. New admins are sent to change their temporary password first.
export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword() && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

// Login / forgot / reset pages: signed-in admins go straight to the dashboard.
export function PublicOnlyRoute({ children }) {
  useLocation(); // re-check on every navigation

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}