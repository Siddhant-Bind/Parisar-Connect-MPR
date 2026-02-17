import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * Protected Route Component
 * Ensures only authenticated users with correct roles can access routes
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  // Get user from localStorage (set during login)
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    // Not authenticated - redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (!user.role) {
      // Invalid user object - redirect to login
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
      // User doesn't have permission - redirect to unauthorized or their dashboard
      const dashboardMap: Record<string, string> = {
        ADMIN: "/dashboard/admin",
        RESIDENT: "/dashboard/resident",
        GUARD: "/dashboard/guard",
      };

      const userDashboard = dashboardMap[user.role] || "/";
      return <Navigate to={userDashboard} replace />;
    }

    // User is authenticated and has correct role
    return <>{children}</>;
  } catch (error) {
    // Error parsing user data - redirect to login
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
};
