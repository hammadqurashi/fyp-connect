import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { authRoutes } from "@/core/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("student" | "supervisor" | "admin")[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const user = useSelector((state: any) => state.auth.user);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const location = useLocation();

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

  return <>{children}</>;
};

export default ProtectedRoute;

