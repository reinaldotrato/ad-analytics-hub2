import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { CrmRoute } from "@/components/auth/CrmRoute";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageLoader } from "@/components/layout/PageLoader";

// Lazy loaded pages - Code splitting para reduzir bundle inicial
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminGlobalDashboard = lazy(() => import("./pages/AdminGlobalDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));
const SystemMonitor = lazy(() => import("./pages/SystemMonitor"));

// CRM Pages - Lazy loaded separadamente para code splitting do módulo CRM
const CrmPipeline = lazy(() => import("./features/crm/pages/CrmPipeline").then(m => ({ default: m.CrmPipeline })));
const CrmDealDetail = lazy(() => import("./features/crm/pages/CrmDealDetail").then(m => ({ default: m.CrmDealDetail })));
const CrmDashboard = lazy(() => import("./features/crm/pages/CrmDashboard").then(m => ({ default: m.CrmDashboard })));
const CrmReports = lazy(() => import("./features/crm/pages/CrmReports").then(m => ({ default: m.CrmReports })));
const CrmContacts = lazy(() => import("./features/crm/pages/CrmContacts").then(m => ({ default: m.CrmContacts })));
const CrmCompanies = lazy(() => import("./features/crm/pages/CrmCompanies").then(m => ({ default: m.CrmCompanies })));
const CrmCalendar = lazy(() => import("./features/crm/pages/CrmCalendar").then(m => ({ default: m.CrmCalendar })));
const CrmSettings = lazy(() => import("./features/crm/pages/CrmSettings").then(m => ({ default: m.CrmSettings })));
const CrmGoals = lazy(() => import("./features/crm/pages/CrmGoals").then(m => ({ default: m.CrmGoals })));
const CrmTeamProductivity = lazy(() => import("./features/crm/pages/CrmTeamProductivity").then(m => ({ default: m.CrmTeamProductivity })));
const CrmDetailPage = lazy(() => import("./features/crm/pages/CrmDetailPage").then(m => ({ default: m.CrmDetailPage })));

// Configuração otimizada do QueryClient para melhor performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 segundos - dados são considerados frescos
      gcTime: 5 * 60 * 1000,       // 5 minutos - tempo de garbage collection
      retry: 1,                     // Apenas 1 retry em caso de erro
      refetchOnWindowFocus: false,  // Não refetch ao focar na janela
    },
  },
});

// App root component with all providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<RoleBasedRedirect />} />
                  <Route path="admin/global-dashboard" element={
                    <AdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <AdminGlobalDashboard />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="dashboard" element={
                    <AdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <Dashboard />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="client-dashboard" element={
                    <Suspense fallback={<PageLoader />}>
                      <ClientDashboard />
                    </Suspense>
                  } />
                  <Route path="reports" element={
                    <AdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <Reports />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="settings" element={
                    <AdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <Settings />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="support-tickets" element={
                    <AdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <SupportTickets />
                      </Suspense>
                    </AdminRoute>
                  } />
                  <Route path="system-monitor" element={
                    <AdminRoute>
                      <Suspense fallback={<PageLoader />}>
                        <SystemMonitor />
                      </Suspense>
                    </AdminRoute>
                  } />
                  {/* CRM Routes - accessible by admin, analyst, crm_admin, crm_user */}
                  <Route path="crm/pipeline" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmPipeline />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/deals/:id" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmDealDetail />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/details/:type/:id" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmDetailPage />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/dashboard" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmDashboard />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/reports" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmReports />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/goals" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmGoals />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/contacts" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmContacts />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/companies" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmCompanies />
                      </Suspense>
                    </CrmRoute>
                  } />
                  <Route path="crm/calendar" element={
                    <CrmRoute>
                      <Suspense fallback={<PageLoader />}>
                        <CrmCalendar />
                      </Suspense>
                    </CrmRoute>
                  } />
                  {/* Team Productivity - requires crm_admin or higher */}
                  <Route path="crm/team-productivity" element={
                    <CrmRoute requireSettings>
                      <Suspense fallback={<PageLoader />}>
                        <CrmTeamProductivity />
                      </Suspense>
                    </CrmRoute>
                  } />
                  {/* CRM Settings - requires crm_admin or higher */}
                  <Route path="crm/settings" element={
                    <CrmRoute requireSettings>
                      <Suspense fallback={<PageLoader />}>
                        <CrmSettings />
                      </Suspense>
                    </CrmRoute>
                  } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
