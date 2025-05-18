import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true for routes requiring auth, false for routes that should not be accessed when logged in
  roleRequired?: string; // optional role requirement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  roleRequired = undefined,
}) => {
  const { loading, authorized, userData } = useAuth();
  const location = useLocation();
  const userRole = userData?.type || "student"; // Default to student if no role found

  if (loading) {
    return <Loading />;
  }

  if (requireAuth) {
    // If not authorized, redirect to login
    if (!authorized) {
      console.log("Not authorized, redirecting to login");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If role is required and user doesn't have the required role
    if (roleRequired && userRole !== roleRequired) {
      console.log(
        `Role mismatch: required=${roleRequired}, actual=${userRole}`
      );
      // Redirect to the user's actual role dashboard
      return <Navigate to={`/dashboard/${userRole}/home`} replace />;
    }

    // If authorized and role check passes, show the children
    return <>{children}</>;
  }
  // For auth-only routes (requireAuth=false) - like login/register that shouldn't be accessed when logged in
  else {
    // If already authorized, redirect to dashboard based on role
    if (authorized) {
      console.log(`Already authorized, redirecting to ${userRole} dashboard`);
      return (
        <Navigate
          to={`/dashboard/${userRole}/${
            userRole === "admin" ? "users-list" : "home"
          }`}
          replace
        />
      );
    }
    // If not authorized, show the children
    return <>{children}</>;
  }
};

export default ProtectedRoute;
