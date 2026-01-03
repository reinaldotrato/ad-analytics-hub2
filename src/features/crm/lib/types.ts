// CRM Module TypeScript Interfaces

export interface Company {
  id: string;
  client_id: string;
  name: string;
  industry?: string;
  phone?: string;
  email?: string;
  website?: string;
  cnpj?: string;
  address?: string;
  state?: string;
  city?: string;
  created_at: string;
}

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  position?: string;
  avatar_url?: string;
  company_id?: string;
  company?: Company;
  created_at: string;
}

export interface FunnelStage {
  id: string;
  client_id: string;
  funnel_id?: string;
  name: string;
  order: number;
  color: string;
  is_won?: boolean;
  is_lost?: boolean;
}

export interface Product {
  id: string;
  client_id: string;
  code: string;
  name: string;
  description?: string;
  unit_price: number;
  category?: string;
  is_active?: boolean;
}

export interface DealProduct {
  id: string;
  deal_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  client_id: string;
  created_at: string;
  product?: Product;
}

export interface Deal {
  id: string;
  client_id: string;
  name: string;
  value: number;
  probability: number;
  expected_close_date?: string;
  stage_id: string;
  contact_id?: string;
  assigned_to_id?: string;
  created_by_id?: string;
  source?: string;
  source_lead_id?: string;
  status?: string;
  days_without_interaction?: number;
  lost_reason?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  // Nested relations (simulating Supabase JOIN)
  contact?: Contact;
  funnel_stage?: FunnelStage;
  assigned_to?: { id: string; email: string };
  created_by?: { id: string; name: string; email: string };
  products?: DealProduct[];
  // Calculated field for pending tasks count
  pending_tasks_count?: number;
}

export interface Task {
  id: string;
  client_id: string;
  deal_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  assigned_to_id?: string;
  assigned_to?: { id: string; email: string };
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  client_id: string;
  deal_id: string;
  user_id?: string;
  event_type: 'note' | 'email' | 'call' | 'meeting' | 'stage_change' | 'task_completed';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: { id: string; email: string };
}

export interface CrmMetrics {
  total_deals: number;
  total_value: number;
  won_deals: number;
  won_value: number;
  lost_deals: number;
  lost_value: number;
  pending_tasks: number;
  overdue_tasks: number;
  conversion_rate: number;
  average_deal_value: number;
}

export interface FunnelStageWithMetrics extends FunnelStage {
  deals_count: number;
  deals_value: number;
}

// Report Types
export interface Seller {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface SellerMetrics {
  seller: Seller;
  opportunities_count: number;
  sales_count: number;
  total_value: number;
  conversion_rate: number;
}

export interface LostOpportunity {
  deal: Deal;
  reason: string;
  closed_at: string;
  value: number;
  seller_name: string;
}

export interface SalesPeriodData {
  period: string;
  total_value: number;
  deals_count: number;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  seller_id?: string;
  stage_id?: string;
  status?: 'open' | 'won' | 'lost' | 'all';
  source?: string;
}

// Goal Types
export interface Goal {
  id: string;
  client_id: string;
  seller_id?: string;
  period_type: 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  sales_quantity_goal: number;
  sales_value_goal: number;
  leads_goal: number;
  opportunities_goal: number;
  lead_to_sale_rate: number;
  lead_to_opportunity_rate: number;
  opportunity_to_sale_rate: number;
  created_at: string;
  updated_at: string;
  // Nested relation
  seller?: Seller;
}

export interface ConversionRates {
  leadToSale: number;
  leadToOpportunity: number;
  opportunityToSale: number;
  totalLeads: number;
  totalOpportunities: number;
  totalSales: number;
}

export interface GoalProgress {
  goal: Goal;
  currentSalesQuantity: number;
  currentSalesValue: number;
  currentLeads: number;
  currentOpportunities: number;
  salesQuantityProgress: number;
  salesValueProgress: number;
  leadsProgress: number;
  opportunitiesProgress: number;
}
