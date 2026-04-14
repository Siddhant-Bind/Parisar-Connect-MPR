import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

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
  // Hooks must be called unconditionally, before any early returns
  const location = useLocation();
  const { user } = useAuth();

  if (!user) {
    // Not authenticated - redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    // Invalid user object - redirect to login
    return <Navigate to="/login" replace />;
  }

  // Force password change if required
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  // Admin without a society cannot access dashboard — redirect to create/join
  // Skip this check if already on the create or join society pages to prevent infinite loop
  if (
    user.role === "ADMIN" &&
    !user.societyId &&
    !location.pathname.startsWith("/create-society") &&
    !location.pathname.startsWith("/join-society")
  ) {
    return <Navigate to="/create-society" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // User doesn't have permission - redirect to their dashboard
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
};
