import { Navigate } from "react-router-dom";
import { useAuth, isCrmOnlyRole, canAccessDashboards } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/layout/PageLoader";

export function RoleBasedRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin goes to global dashboard
  if (role === 'admin') {
    return <Navigate to="/admin/global-dashboard" replace />;
  }

  // CRM-only roles go to pipeline
  if (isCrmOnlyRole(role)) {
    return <Navigate to="/crm/pipeline" replace />;
  }

  // Analysts and managers go to dashboard
  if (canAccessDashboards(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Default: client dashboard
  return <Navigate to="/client-dashboard" replace />;
}
