import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/layout/PageLoader";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin, analyst and manager can access admin routes
  const allowedRoles = ['admin', 'analyst', 'manager', 'crm_admin'];
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/client-dashboard" replace />;
  }

  return <>{children}</>;
}
