// CRM Module exports
export { CrmPipeline } from './pages/CrmPipeline';
export { CrmDealDetail } from './pages/CrmDealDetail';
export { CrmDashboard } from './pages/CrmDashboard';
export { CrmReports } from './pages/CrmReports';
export { CrmContacts } from './pages/CrmContacts';
export { CrmCompanies } from './pages/CrmCompanies';
export { CrmCalendar } from './pages/CrmCalendar';
export { CrmSettings } from './pages/CrmSettings';
export { CrmGoals } from './pages/CrmGoals';
export { CrmTeamProductivity } from './pages/CrmTeamProductivity';

// Hooks
export { useDeals } from './hooks/useDeals';
export { useDealById } from './hooks/useDealById';
export { useFunnelStages } from './hooks/useFunnelStages';
export { useCrmMetrics } from './hooks/useCrmMetrics';
export { useCrmReports } from './hooks/useCrmReports';

// Types
export type {
  Company,
  Contact,
  Deal,
  FunnelStage,
  Task,
  TimelineEvent,
  CrmMetrics,
  FunnelStageWithMetrics,
  Seller,
  SellerMetrics,
  LostOpportunity,
  SalesPeriodData,
  ReportFilters,
  Goal,
  ConversionRates,
  GoalProgress,
} from './lib/types';
