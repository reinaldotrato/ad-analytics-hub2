import type { FunnelStage, Deal, Task, TimelineEvent, Contact, Company, Seller, SellerMetrics, LostOpportunity, SalesPeriodData, ReportFilters } from './types';

// Mock Funnel Stages
export const mockFunnelStages: FunnelStage[] = [
  { id: 'stage-1', client_id: 'mock-client', name: 'Novo Lead', order: 1, color: '#3B82F6' },
  { id: 'stage-2', client_id: 'mock-client', name: 'Qualificação', order: 2, color: '#8B5CF6' },
  { id: 'stage-3', client_id: 'mock-client', name: 'Proposta', order: 3, color: '#EC4899' },
  { id: 'stage-4', client_id: 'mock-client', name: 'Negociação', order: 4, color: '#F97316' },
  { id: 'stage-5', client_id: 'mock-client', name: 'Fechado Ganho', order: 5, color: '#10B981', is_won: true },
  { id: 'stage-6', client_id: 'mock-client', name: 'Fechado Perdido', order: 6, color: '#EF4444', is_lost: true },
];

// Mock Sellers
export const mockSellers: Seller[] = [
  { id: 'seller-1', name: 'Ana Rodrigues', email: 'ana@tryvia.com', avatar_url: '' },
  { id: 'seller-2', name: 'Bruno Costa', email: 'bruno@tryvia.com', avatar_url: '' },
  { id: 'seller-3', name: 'Carla Mendes', email: 'carla@tryvia.com', avatar_url: '' },
  { id: 'seller-4', name: 'Diego Alves', email: 'diego@tryvia.com', avatar_url: '' },
];

// Lost Reasons
export const lostReasons = [
  'Orçamento Insuficiente',
  'Concorrência',
  'Timing Inadequado',
  'Mudança de Prioridades',
  'Falta de Resposta',
  'Escopo Incompatível',
];

// Mock Companies
export const mockCompanies: Company[] = [
  { id: 'comp-1', client_id: 'mock-client', name: 'Tech Solutions Ltda', industry: 'Tecnologia', email: 'contato@techsolutions.com', phone: '(11) 3333-1111', created_at: '2025-01-01T10:00:00Z' },
  { id: 'comp-2', client_id: 'mock-client', name: 'Marketing Digital Pro', industry: 'Marketing', email: 'contato@mktpro.com', phone: '(11) 3333-2222', created_at: '2025-01-05T10:00:00Z' },
  { id: 'comp-3', client_id: 'mock-client', name: 'E-commerce Brasil', industry: 'Varejo', email: 'contato@ecommerce.com', phone: '(11) 3333-3333', created_at: '2025-01-10T10:00:00Z' },
];

// Mock Contacts
export const mockContacts: Contact[] = [
  { id: 'contact-1', client_id: 'mock-client', name: 'João Silva', email: 'joao@techsolutions.com', phone: '(11) 99999-0001', position: 'Diretor de TI', company_id: 'comp-1', company: mockCompanies[0], created_at: '2025-01-01T10:00:00Z' },
  { id: 'contact-2', client_id: 'mock-client', name: 'Maria Santos', email: 'maria@mktpro.com', phone: '(11) 99999-0002', position: 'CEO', company_id: 'comp-2', company: mockCompanies[1], created_at: '2025-01-05T10:00:00Z' },
  { id: 'contact-3', client_id: 'mock-client', name: 'Carlos Oliveira', email: 'carlos@ecommerce.com', phone: '(11) 99999-0003', position: 'Gerente de Compras', company_id: 'comp-3', company: mockCompanies[2], created_at: '2025-01-10T10:00:00Z' },
  { id: 'contact-4', client_id: 'mock-client', name: 'Ana Costa', email: 'ana@startup.io', phone: '(11) 99999-0004', position: 'Fundadora', created_at: '2025-01-15T10:00:00Z' },
  { id: 'contact-5', client_id: 'mock-client', name: 'Pedro Mendes', email: 'pedro@consulta.com', phone: '(11) 99999-0005', position: 'Consultor', created_at: '2025-01-20T10:00:00Z' },
];

// Mock Deals with nested relations - expanded with more data and varied dates
export const mockDeals: Deal[] = [
  // Stage 1 - Novo Lead
  {
    id: 'deal-1',
    client_id: 'mock-client',
    name: 'Projeto Website Corporativo',
    value: 15000,
    probability: 70,
    stage_id: 'stage-2',
    contact_id: 'contact-1',
    assigned_to_id: 'seller-1',
    source: 'meta_ads',
    created_at: '2025-12-01T10:00:00Z',
    updated_at: '2025-12-05T14:00:00Z',
    contact: mockContacts[0],
    funnel_stage: mockFunnelStages[1],
    assigned_to: { id: 'seller-1', email: 'ana@tryvia.com' },
  },
  {
    id: 'deal-2',
    client_id: 'mock-client',
    name: 'Campanha de Marketing Digital',
    value: 8500,
    probability: 50,
    stage_id: 'stage-1',
    contact_id: 'contact-2',
    assigned_to_id: 'seller-2',
    source: 'whatsapp',
    created_at: '2025-12-03T09:00:00Z',
    updated_at: '2025-12-03T09:00:00Z',
    contact: mockContacts[1],
    funnel_stage: mockFunnelStages[0],
    assigned_to: { id: 'seller-2', email: 'bruno@tryvia.com' },
  },
  {
    id: 'deal-3',
    client_id: 'mock-client',
    name: 'Integração E-commerce',
    value: 25000,
    probability: 80,
    stage_id: 'stage-3',
    contact_id: 'contact-3',
    assigned_to_id: 'seller-1',
    source: 'site',
    expected_close_date: '2025-12-20',
    created_at: '2025-11-15T11:00:00Z',
    updated_at: '2025-12-10T16:00:00Z',
    contact: mockContacts[2],
    funnel_stage: mockFunnelStages[2],
    assigned_to: { id: 'seller-1', email: 'ana@tryvia.com' },
  },
  {
    id: 'deal-4',
    client_id: 'mock-client',
    name: 'Consultoria em Vendas',
    value: 12000,
    probability: 90,
    stage_id: 'stage-4',
    contact_id: 'contact-4',
    assigned_to_id: 'seller-3',
    source: 'referral',
    expected_close_date: '2025-12-15',
    created_at: '2025-11-20T08:00:00Z',
    updated_at: '2025-12-08T10:00:00Z',
    contact: mockContacts[3],
    funnel_stage: mockFunnelStages[3],
    assigned_to: { id: 'seller-3', email: 'carla@tryvia.com' },
  },
  // Won deals with varied dates
  {
    id: 'deal-5',
    client_id: 'mock-client',
    name: 'Sistema de Gestão',
    value: 45000,
    probability: 100,
    stage_id: 'stage-5',
    contact_id: 'contact-5',
    assigned_to_id: 'seller-1',
    source: 'meta_ads',
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-11-30T15:00:00Z',
    closed_at: '2025-11-30T15:00:00Z',
    contact: mockContacts[4],
    funnel_stage: mockFunnelStages[4],
    assigned_to: { id: 'seller-1', email: 'ana@tryvia.com' },
  },
  {
    id: 'deal-8',
    client_id: 'mock-client',
    name: 'Plataforma de Cursos Online',
    value: 32000,
    probability: 100,
    stage_id: 'stage-5',
    contact_id: 'contact-1',
    assigned_to_id: 'seller-2',
    source: 'site',
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-11-15T15:00:00Z',
    closed_at: '2025-11-15T15:00:00Z',
    contact: mockContacts[0],
    funnel_stage: mockFunnelStages[4],
    assigned_to: { id: 'seller-2', email: 'bruno@tryvia.com' },
  },
  {
    id: 'deal-9',
    client_id: 'mock-client',
    name: 'App Mobile Delivery',
    value: 55000,
    probability: 100,
    stage_id: 'stage-5',
    contact_id: 'contact-3',
    assigned_to_id: 'seller-3',
    source: 'meta_ads',
    created_at: '2025-09-20T10:00:00Z',
    updated_at: '2025-10-25T15:00:00Z',
    closed_at: '2025-10-25T15:00:00Z',
    contact: mockContacts[2],
    funnel_stage: mockFunnelStages[4],
    assigned_to: { id: 'seller-3', email: 'carla@tryvia.com' },
  },
  {
    id: 'deal-10',
    client_id: 'mock-client',
    name: 'CRM Personalizado',
    value: 28000,
    probability: 100,
    stage_id: 'stage-5',
    contact_id: 'contact-4',
    assigned_to_id: 'seller-4',
    source: 'whatsapp',
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-11-05T15:00:00Z',
    closed_at: '2025-11-05T15:00:00Z',
    contact: mockContacts[3],
    funnel_stage: mockFunnelStages[4],
    assigned_to: { id: 'seller-4', email: 'diego@tryvia.com' },
  },
  {
    id: 'deal-11',
    client_id: 'mock-client',
    name: 'Dashboard Analytics',
    value: 18000,
    probability: 100,
    stage_id: 'stage-5',
    contact_id: 'contact-2',
    assigned_to_id: 'seller-1',
    source: 'referral',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-12-01T15:00:00Z',
    closed_at: '2025-12-01T15:00:00Z',
    contact: mockContacts[1],
    funnel_stage: mockFunnelStages[4],
    assigned_to: { id: 'seller-1', email: 'ana@tryvia.com' },
  },
  // New leads
  {
    id: 'deal-6',
    client_id: 'mock-client',
    name: 'Treinamento de Equipe',
    value: 5000,
    probability: 30,
    stage_id: 'stage-1',
    contact_id: 'contact-1',
    assigned_to_id: 'seller-4',
    source: 'whatsapp',
    created_at: '2025-12-10T14:00:00Z',
    updated_at: '2025-12-10T14:00:00Z',
    contact: mockContacts[0],
    funnel_stage: mockFunnelStages[0],
    assigned_to: { id: 'seller-4', email: 'diego@tryvia.com' },
  },
  // Lost deals with reasons
  {
    id: 'deal-7',
    client_id: 'mock-client',
    name: 'Automação de Processos',
    value: 18000,
    probability: 0,
    stage_id: 'stage-6',
    contact_id: 'contact-2',
    assigned_to_id: 'seller-1',
    source: 'meta_ads',
    created_at: '2025-11-01T10:00:00Z',
    updated_at: '2025-12-01T11:00:00Z',
    closed_at: '2025-12-01T11:00:00Z',
    contact: mockContacts[1],
    funnel_stage: mockFunnelStages[5],
    assigned_to: { id: 'seller-1', email: 'ana@tryvia.com' },
  },
  {
    id: 'deal-12',
    client_id: 'mock-client',
    name: 'Sistema de RH',
    value: 22000,
    probability: 0,
    stage_id: 'stage-6',
    contact_id: 'contact-3',
    assigned_to_id: 'seller-2',
    source: 'site',
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-11-20T11:00:00Z',
    closed_at: '2025-11-20T11:00:00Z',
    contact: mockContacts[2],
    funnel_stage: mockFunnelStages[5],
    assigned_to: { id: 'seller-2', email: 'bruno@tryvia.com' },
  },
  {
    id: 'deal-13',
    client_id: 'mock-client',
    name: 'Chatbot WhatsApp',
    value: 9500,
    probability: 0,
    stage_id: 'stage-6',
    contact_id: 'contact-4',
    assigned_to_id: 'seller-3',
    source: 'whatsapp',
    created_at: '2025-11-10T10:00:00Z',
    updated_at: '2025-12-05T11:00:00Z',
    closed_at: '2025-12-05T11:00:00Z',
    contact: mockContacts[3],
    funnel_stage: mockFunnelStages[5],
    assigned_to: { id: 'seller-3', email: 'carla@tryvia.com' },
  },
  // More leads in pipeline
  {
    id: 'deal-14',
    client_id: 'mock-client',
    name: 'Redesign de Marca',
    value: 12000,
    probability: 40,
    stage_id: 'stage-1',
    contact_id: 'contact-5',
    assigned_to_id: 'seller-2',
    source: 'meta_ads',
    created_at: '2025-12-08T10:00:00Z',
    updated_at: '2025-12-08T10:00:00Z',
    contact: mockContacts[4],
    funnel_stage: mockFunnelStages[0],
    assigned_to: { id: 'seller-2', email: 'bruno@tryvia.com' },
  },
  {
    id: 'deal-15',
    client_id: 'mock-client',
    name: 'Sistema de Pagamentos',
    value: 35000,
    probability: 60,
    stage_id: 'stage-2',
    contact_id: 'contact-1',
    assigned_to_id: 'seller-4',
    source: 'referral',
    created_at: '2025-12-05T10:00:00Z',
    updated_at: '2025-12-10T10:00:00Z',
    contact: mockContacts[0],
    funnel_stage: mockFunnelStages[1],
    assigned_to: { id: 'seller-4', email: 'diego@tryvia.com' },
  },
];

// Map deals to lost reasons (only for lost deals)
export const dealLostReasons: Record<string, string> = {
  'deal-7': 'Orçamento Insuficiente',
  'deal-12': 'Concorrência',
  'deal-13': 'Timing Inadequado',
};

// Mock Tasks
export const mockTasks: Task[] = [
  { id: 'task-1', client_id: 'mock-client', deal_id: 'deal-1', title: 'Enviar proposta comercial', description: 'Preparar e enviar proposta detalhada com escopo do projeto', due_date: '2025-12-15T18:00:00Z', completed: false, assigned_to_id: 'seller-1', created_at: '2025-12-05T10:00:00Z' },
  { id: 'task-2', client_id: 'mock-client', deal_id: 'deal-1', title: 'Agendar reunião de alinhamento', completed: true, completed_at: '2025-12-04T16:00:00Z', assigned_to_id: 'seller-1', created_at: '2025-12-02T10:00:00Z' },
  { id: 'task-3', client_id: 'mock-client', deal_id: 'deal-3', title: 'Follow-up sobre proposta', due_date: '2025-12-12T10:00:00Z', completed: false, assigned_to_id: 'seller-1', created_at: '2025-12-08T10:00:00Z' },
  { id: 'task-4', client_id: 'mock-client', deal_id: 'deal-4', title: 'Preparar contrato', due_date: '2025-12-14T18:00:00Z', completed: false, assigned_to_id: 'seller-3', created_at: '2025-12-10T10:00:00Z' },
];

// Mock Timeline Events
export const mockTimelineEvents: TimelineEvent[] = [
  { id: 'event-1', client_id: 'mock-client', deal_id: 'deal-1', user_id: 'seller-1', event_type: 'note', description: 'Cliente interessado em começar o projeto em janeiro', created_at: '2025-12-05T14:00:00Z', user: { id: 'seller-1', email: 'ana@tryvia.com' } },
  { id: 'event-2', client_id: 'mock-client', deal_id: 'deal-1', user_id: 'seller-1', event_type: 'stage_change', description: 'Movido de "Novo Lead" para "Qualificação"', created_at: '2025-12-03T11:00:00Z', user: { id: 'seller-1', email: 'ana@tryvia.com' } },
  { id: 'event-3', client_id: 'mock-client', deal_id: 'deal-1', user_id: 'seller-1', event_type: 'call', description: 'Ligação de qualificação - 15 min', created_at: '2025-12-02T10:30:00Z', user: { id: 'seller-1', email: 'ana@tryvia.com' } },
  { id: 'event-4', client_id: 'mock-client', deal_id: 'deal-3', user_id: 'seller-1', event_type: 'meeting', description: 'Reunião de apresentação do projeto', created_at: '2025-12-10T15:00:00Z', user: { id: 'seller-1', email: 'ana@tryvia.com' } },
  { id: 'event-5', client_id: 'mock-client', deal_id: 'deal-3', user_id: 'seller-1', event_type: 'email', description: 'Enviada proposta comercial por e-mail', created_at: '2025-12-10T17:00:00Z', user: { id: 'seller-1', email: 'ana@tryvia.com' } },
];

// Helper functions
export function getDealsByStage(stageId: string): Deal[] {
  return mockDeals.filter(deal => deal.stage_id === stageId);
}

export function getDealById(dealId: string): Deal | undefined {
  return mockDeals.find(deal => deal.id === dealId);
}

export function getTasksByDeal(dealId: string): Task[] {
  return mockTasks.filter(task => task.deal_id === dealId);
}

export function getTimelineByDeal(dealId: string): TimelineEvent[] {
  return mockTimelineEvents
    .filter(event => event.deal_id === dealId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getCrmMetrics() {
  const wonDeals = mockDeals.filter(d => d.funnel_stage?.is_won);
  const lostDeals = mockDeals.filter(d => d.funnel_stage?.is_lost);
  const openDeals = mockDeals.filter(d => !d.funnel_stage?.is_won && !d.funnel_stage?.is_lost);
  const pendingTasks = mockTasks.filter(t => !t.completed);
  const overdueTasks = pendingTasks.filter(t => t.due_date && new Date(t.due_date) < new Date());

  return {
    total_deals: mockDeals.length,
    total_value: mockDeals.reduce((sum, d) => sum + d.value, 0),
    won_deals: wonDeals.length,
    won_value: wonDeals.reduce((sum, d) => sum + d.value, 0),
    lost_deals: lostDeals.length,
    lost_value: lostDeals.reduce((sum, d) => sum + d.value, 0),
    open_deals: openDeals.length,
    open_value: openDeals.reduce((sum, d) => sum + d.value, 0),
    pending_tasks: pendingTasks.length,
    overdue_tasks: overdueTasks.length,
    conversion_rate: mockDeals.length > 0 ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 : 0,
    average_deal_value: mockDeals.length > 0 ? mockDeals.reduce((sum, d) => sum + d.value, 0) / mockDeals.length : 0,
  };
}

export function getFunnelData() {
  return mockFunnelStages.map(stage => ({
    ...stage,
    deals_count: mockDeals.filter(d => d.stage_id === stage.id).length,
    deals_value: mockDeals.filter(d => d.stage_id === stage.id).reduce((sum, d) => sum + d.value, 0),
  }));
}

// Report Helper Functions
export function getFilteredDeals(filters: ReportFilters): Deal[] {
  return mockDeals.filter(deal => {
    // Date filter
    if (filters.startDate) {
      const dealDate = new Date(deal.created_at);
      if (dealDate < filters.startDate) return false;
    }
    if (filters.endDate) {
      const dealDate = new Date(deal.created_at);
      if (dealDate > filters.endDate) return false;
    }
    // Seller filter
    if (filters.seller_id && deal.assigned_to_id !== filters.seller_id) return false;
    // Stage filter
    if (filters.stage_id && deal.stage_id !== filters.stage_id) return false;
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'won' && !deal.funnel_stage?.is_won) return false;
      if (filters.status === 'lost' && !deal.funnel_stage?.is_lost) return false;
      if (filters.status === 'open' && (deal.funnel_stage?.is_won || deal.funnel_stage?.is_lost)) return false;
    }
    // Source filter
    if (filters.source && deal.source !== filters.source) return false;
    return true;
  });
}

export function getSellerMetrics(filters: ReportFilters): SellerMetrics[] {
  const filteredDeals = getFilteredDeals(filters);
  
  return mockSellers.map(seller => {
    const sellerDeals = filteredDeals.filter(d => d.assigned_to_id === seller.id);
    const wonDeals = sellerDeals.filter(d => d.funnel_stage?.is_won);
    const opportunities = sellerDeals.filter(d => !d.funnel_stage?.is_lost);
    
    return {
      seller,
      opportunities_count: opportunities.length,
      sales_count: wonDeals.length,
      total_value: wonDeals.reduce((sum, d) => sum + d.value, 0),
      conversion_rate: opportunities.length > 0 ? (wonDeals.length / opportunities.length) * 100 : 0,
    };
  });
}

export function getLostOpportunities(filters: ReportFilters): LostOpportunity[] {
  const filteredDeals = getFilteredDeals(filters);
  const lostDeals = filteredDeals.filter(d => d.funnel_stage?.is_lost);
  
  return lostDeals.map(deal => {
    const seller = mockSellers.find(s => s.id === deal.assigned_to_id);
    return {
      deal,
      reason: dealLostReasons[deal.id] || 'Não especificado',
      closed_at: deal.closed_at || deal.updated_at,
      value: deal.value,
      seller_name: seller?.name || 'Desconhecido',
    };
  });
}

export function getSalesByPeriod(filters: ReportFilters, groupBy: 'day' | 'week' | 'month'): SalesPeriodData[] {
  const filteredDeals = getFilteredDeals(filters);
  const wonDeals = filteredDeals.filter(d => d.funnel_stage?.is_won && d.closed_at);
  
  const grouped: Record<string, { total_value: number; deals_count: number }> = {};
  
  wonDeals.forEach(deal => {
    const date = new Date(deal.closed_at!);
    let period: string;
    
    if (groupBy === 'day') {
      period = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      period = `Semana ${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
    } else {
      period = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    }
    
    if (!grouped[period]) {
      grouped[period] = { total_value: 0, deals_count: 0 };
    }
    grouped[period].total_value += deal.value;
    grouped[period].deals_count += 1;
  });
  
  return Object.entries(grouped)
    .map(([period, data]) => ({ period, ...data }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

export function getOverviewMetrics(filters: ReportFilters) {
  const filteredDeals = getFilteredDeals(filters);
  const wonDeals = filteredDeals.filter(d => d.funnel_stage?.is_won);
  const lostDeals = filteredDeals.filter(d => d.funnel_stage?.is_lost);
  const opportunities = filteredDeals.filter(d => 
    d.stage_id === 'stage-3' || d.stage_id === 'stage-4' || d.funnel_stage?.is_won || d.funnel_stage?.is_lost
  );
  
  const closedDeals = wonDeals.length + lostDeals.length;
  
  return {
    total_leads: filteredDeals.length,
    total_opportunities: opportunities.length,
    total_sales: wonDeals.length,
    conversion_rate: closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0,
    average_ticket: wonDeals.length > 0 
      ? wonDeals.reduce((sum, d) => sum + d.value, 0) / wonDeals.length 
      : 0,
  };
}

export function getFunnelMetrics(filters: ReportFilters) {
  const filteredDeals = getFilteredDeals(filters);
  
  return mockFunnelStages.map((stage, index) => {
    const stageDeals = filteredDeals.filter(d => d.stage_id === stage.id);
    const previousStageDeals = index > 0 
      ? filteredDeals.filter(d => d.stage_id === mockFunnelStages[index - 1].id)
      : null;
    
    const conversionRate = previousStageDeals && previousStageDeals.length > 0
      ? (stageDeals.length / previousStageDeals.length) * 100
      : null;
    
    return {
      stage,
      deals_count: stageDeals.length,
      deals_value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      conversion_rate: conversionRate,
    };
  });
}
