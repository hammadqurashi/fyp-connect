import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { authRoutes } from "@/core/routes";
import { useProfileComplete } from "@/shared/hooks/use-profile-complete";
import { LoadingSpinner } from "@/shared/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "supervisor" | "admin")[];
  requireAuth?: boolean;
  requireProfileComplete?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  requireProfileComplete = true,
}) => {
  const user = useSelector((state: any) => state.auth.user);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const location = useLocation();
  const { isComplete, loading } = useProfileComplete();

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!isLoggedIn || !user) {
    return (
      <Navigate
        to={authRoutes.LOGIN_ROUTE}
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Check profile completion for students and supervisors
  if (
    requireProfileComplete &&
    (user.role === "student" || user.role === "supervisor") &&
    location.pathname !== "/profile-setup"
  ) {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    if (!isComplete) {
      // Redirect to profile setup if profile is not complete
      return <Navigate to="/profile-setup" />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
