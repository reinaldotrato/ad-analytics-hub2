import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, canAccessCrm, canAccessCrmSettings } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/layout/PageLoader";

export interface CrmRouteProps {
  children: ReactNode;
  requireSettings?: boolean;
}

export function CrmRoute({ children, requireSettings = false }: CrmRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user can access CRM
  if (!canAccessCrm(role)) {
    return <Navigate to="/client-dashboard" replace />;
  }

  // If route requires settings access (like CRM settings or team productivity)
  if (requireSettings && !canAccessCrmSettings(role)) {
    return <Navigate to="/crm/pipeline" replace />;
  }

  return <>{children}</>;
}
