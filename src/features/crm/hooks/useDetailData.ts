import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type DetailEntityType = 'deal' | 'contact' | 'company';

export interface DetailData {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  // Deal specific
  value?: number;
  status?: string;
  expected_close_date?: string;
  closed_at?: string;
  probability?: number;
  source?: string;
  lost_reason?: string;
  days_without_interaction?: number;
  stage_id?: string;
  contact_id?: string;
  assigned_to_id?: string;
  custom_fields?: unknown;
  // Contact specific
  email?: string;
  phone?: string;
  mobile_phone?: string;
  position?: string;
  // Company specific
  cnpj?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  industry?: string;
  // Relations
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    mobile_phone?: string;
    position?: string;
  };
  company?: {
    id: string;
    name: string;
    phone?: string;
    cnpj?: string;
  };
  funnel_stage?: {
    id: string;
    name: string;
    color: string;
    order: number;
    is_won?: boolean;
    is_lost?: boolean;
  };
  assigned_to?: {
    id: string;
    email: string;
    name?: string;
  };
  timeline?: Array<{
    id: string;
    event_type: string;
    description: string;
    created_at: string;
    metadata?: unknown;
  }>;
  deals?: Array<{
    id: string;
    name: string;
    value: number;
    status?: string;
  }>;
  contacts?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
  dealContacts?: Array<{
    id: string;
    contact_id: string;
    is_primary: boolean;
    contact?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      mobile_phone?: string;
    };
  }>;
  dealCompanies?: Array<{
    id: string;
    company_id: string;
    is_primary: boolean;
    company?: {
      id: string;
      name: string;
      phone?: string;
      cnpj?: string;
    };
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    completed: boolean;
  }>;
  stages?: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
    is_won?: boolean;
    is_lost?: boolean;
  }>;
}

export function useDetailData(type: DetailEntityType, id: string) {
  const { clientId, selectedClientId, role } = useAuth();
  const effectiveClientId = role === 'admin' ? selectedClientId || clientId : clientId;

  return useQuery({
    queryKey: ['crm-detail', type, id, effectiveClientId],
    queryFn: async (): Promise<DetailData | null> => {
      if (!effectiveClientId || !id) return null;

      if (type === 'deal') {
        // Fetch deal with relations
        const { data: deal, error: dealError } = await supabase
          .from('crm_deals')
          .select(`
            *,
            funnel_stage:crm_funnel_stages(*)
          `)
          .eq('id', id)
          .eq('client_id', effectiveClientId)
          .single();

        if (dealError) throw dealError;
        if (!deal) return null;

        // Fetch deal contacts (many-to-many)
        const { data: dealContacts } = await supabase
          .from('crm_deal_contacts')
          .select(`
            *,
            contact:crm_contacts(*)
          `)
          .eq('deal_id', id)
          .order('is_primary', { ascending: false });

        // Get primary contact for backwards compatibility
        const primaryDealContact = dealContacts?.find(dc => dc.is_primary) || dealContacts?.[0];
        const contact = primaryDealContact?.contact || null;

        // Fetch deal companies (many-to-many)
        const { data: dealCompanies } = await supabase
          .from('crm_deal_companies')
          .select(`
            *,
            company:crm_companies(*)
          `)
          .eq('deal_id', id)
          .order('is_primary', { ascending: false });

        // Get primary company for backwards compatibility
        const primaryDealCompany = dealCompanies?.find(dc => dc.is_primary) || dealCompanies?.[0];
        const company = primaryDealCompany?.company || null;

        // Fetch timeline events
        const { data: timeline } = await supabase
          .from('crm_timeline_events')
          .select('*')
          .eq('deal_id', id)
          .eq('client_id', effectiveClientId)
          .order('created_at', { ascending: false });

        // Fetch tasks
        const { data: tasks } = await supabase
          .from('crm_tasks')
          .select('*')
          .eq('deal_id', id)
          .eq('client_id', effectiveClientId)
          .order('due_date', { ascending: true });

        // Fetch funnel stages for header tabs - filtered by the deal's funnel
        let stages: Array<{
          id: string;
          name: string;
          color: string;
          order: number;
          is_won?: boolean;
          is_lost?: boolean;
        }> = [];
        
        const dealFunnelId = deal.funnel_stage?.funnel_id;
        if (dealFunnelId) {
          const { data: stagesData } = await supabase
            .from('crm_funnel_stages')
            .select('*')
            .eq('client_id', effectiveClientId)
            .eq('funnel_id', dealFunnelId)
            .order('order', { ascending: true });
          stages = stagesData || [];
        }

        // Fetch assigned user info
        let assigned_to = null;
        if (deal.assigned_to_id) {
          const { data: seller } = await supabase
            .from('crm_sellers')
            .select('id, name, email')
            .eq('id', deal.assigned_to_id)
            .single();
          assigned_to = seller;
        }

        return {
          ...deal,
          contact,
          company,
          dealContacts: dealContacts || [],
          dealCompanies: dealCompanies || [],
          timeline: timeline || [],
          tasks: tasks || [],
          stages: stages || [],
          assigned_to,
        };
      }

      if (type === 'contact') {
        // Fetch contact with company
        const { data: contact, error: contactError } = await supabase
          .from('crm_contacts')
          .select(`
            *,
            company:crm_companies(*)
          `)
          .eq('id', id)
          .eq('client_id', effectiveClientId)
          .single();

        if (contactError) throw contactError;
        if (!contact) return null;

        // Fetch deals for this contact
        const { data: deals } = await supabase
          .from('crm_deals')
          .select('id, name, value, status')
          .eq('contact_id', id)
          .eq('client_id', effectiveClientId);

        return {
          ...contact,
          deals: deals || [],
        };
      }

      if (type === 'company') {
        // Fetch company
        const { data: company, error: companyError } = await supabase
          .from('crm_companies')
          .select('*')
          .eq('id', id)
          .eq('client_id', effectiveClientId)
          .single();

        if (companyError) throw companyError;
        if (!company) return null;

        // Fetch contacts for this company
        const { data: contacts } = await supabase
          .from('crm_contacts')
          .select('id, name, email, phone')
          .eq('company_id', id)
          .eq('client_id', effectiveClientId);

        // Fetch deals through contacts
        const contactIds = contacts?.map(c => c.id) || [];
        let deals: Array<{ id: string; name: string; value: number; status?: string }> = [];
        if (contactIds.length > 0) {
          const { data: dealsData } = await supabase
            .from('crm_deals')
            .select('id, name, value, status')
            .in('contact_id', contactIds)
            .eq('client_id', effectiveClientId);
          deals = dealsData || [];
        }

        return {
          ...company,
          contacts,
          deals,
        };
      }

      return null;
    },
    enabled: !!effectiveClientId && !!id,
  });
}
