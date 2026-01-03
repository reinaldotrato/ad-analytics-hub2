import { supabase } from '@/integrations/supabase/client';

export interface CrmCompany {
  id: string;
  client_id: string;
  name: string;
  industry?: string;
  email?: string;
  phone?: string;
  website?: string;
  cnpj?: string;
  address?: string;
  state?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface CrmContact {
  id: string;
  client_id: string;
  company_id?: string;
  name: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  position?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  company?: CrmCompany;
}

export interface CrmFunnelStage {
  id: string;
  client_id: string;
  funnel_id?: string;
  name: string;
  order: number;
  color: string;
  is_won?: boolean;
  is_lost?: boolean;
  created_at: string;
}

export interface CrmFunnel {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
}

export interface CrmProduct {
  id: string;
  client_id: string;
  code: string;
  name: string;
  description?: string;
  unit_price: number;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmLossReason {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmDeal {
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
  custom_fields?: unknown;
  contact?: CrmContact;
  funnel_stage?: CrmFunnelStage;
  assigned_to?: { id: string; email: string };
  created_by?: { id: string; name: string; email: string };
}

export type TaskType = 'call' | 'meeting' | 'whatsapp';

export interface CrmTask {
  id: string;
  client_id: string;
  deal_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  assigned_to_id?: string;
  task_type?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface CrmTaskWithContact extends CrmTask {
  deal?: {
    id: string;
    name: string;
    contact?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      mobile_phone?: string;
    };
  };
}

export interface CrmTimelineEvent {
  id: string;
  client_id: string;
  deal_id?: string;
  user_id?: string;
  event_type: 'note' | 'email' | 'call' | 'meeting' | 'stage_change' | 'task_completed' | 'whatsapp' | 'visit';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CrmCustomFieldDefinition {
  id: string;
  client_id: string;
  entity_type: string;
  name: string;
  field_type: string;
  options?: unknown;
  is_required?: boolean;
  order?: number;
  created_at: string;
  updated_at: string;
}

export interface CrmDealFile {
  id: string;
  client_id: string;
  deal_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by_id?: string;
  created_at: string;
}

// =============================================
// Companies
// =============================================

export async function getCompanies(clientId: string): Promise<CrmCompany[]> {
  const { data, error } = await supabase
    .from('crm_companies')
    .select('id, client_id, name, industry, email, phone, website, cnpj, address, state, city, created_at, updated_at')
    .eq('client_id', clientId)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createCompany(company: Omit<CrmCompany, 'id' | 'created_at' | 'updated_at'>): Promise<CrmCompany> {
  const { data, error } = await supabase
    .from('crm_companies')
    .insert(company)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCompany(id: string, updates: Partial<CrmCompany>): Promise<CrmCompany> {
  const { data, error } = await supabase
    .from('crm_companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_companies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Contacts
// =============================================

export async function getContacts(clientId: string): Promise<CrmContact[]> {
  const { data, error } = await supabase
    .from('crm_contacts')
    .select(`
      *,
      company:crm_companies(*)
    `)
    .eq('client_id', clientId)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createContact(contact: Omit<CrmContact, 'id' | 'created_at' | 'updated_at' | 'company'>): Promise<CrmContact> {
  const { data, error } = await supabase
    .from('crm_contacts')
    .insert(contact)
    .select(`
      *,
      company:crm_companies(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateContact(id: string, updates: Partial<CrmContact>): Promise<CrmContact> {
  // Remove nested objects before update
  const { company, ...cleanUpdates } = updates;
  
  const { data, error } = await supabase
    .from('crm_contacts')
    .update(cleanUpdates)
    .eq('id', id)
    .select(`
      *,
      company:crm_companies(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_contacts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Funnel Stages
// =============================================

export async function getFunnelStages(clientId: string): Promise<CrmFunnelStage[]> {
  const { data, error } = await supabase
    .from('crm_funnel_stages')
    .select('id, client_id, funnel_id, name, order, color, is_won, is_lost, created_at')
    .eq('client_id', clientId)
    .order('order');
  
  if (error) throw error;
  return data || [];
}

export async function createFunnelStage(stage: Omit<CrmFunnelStage, 'id' | 'created_at'>): Promise<CrmFunnelStage> {
  const { data, error } = await supabase
    .from('crm_funnel_stages')
    .insert(stage)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFunnelStage(id: string, updates: Partial<CrmFunnelStage>): Promise<CrmFunnelStage> {
  const { data, error } = await supabase
    .from('crm_funnel_stages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteFunnelStage(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_funnel_stages')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Deals
// =============================================

export async function getDeals(clientId: string): Promise<CrmDeal[]> {
  const { data, error } = await supabase
    .from('crm_deals')
    .select(`
      *,
      contact:crm_contacts(*),
      funnel_stage:crm_funnel_stages(*),
      assigned_to:tryvia_analytics_profiles(id, email)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getDealById(dealId: string): Promise<CrmDeal | null> {
  const { data, error } = await supabase
    .from('crm_deals')
    .select(`
      *,
      contact:crm_contacts(*),
      funnel_stage:crm_funnel_stages(*),
      assigned_to:tryvia_analytics_profiles(id, email)
    `)
    .eq('id', dealId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function createDeal(deal: Omit<CrmDeal, 'id' | 'created_at' | 'updated_at' | 'contact' | 'funnel_stage' | 'assigned_to'>): Promise<CrmDeal> {
  const { data, error } = await supabase
    .from('crm_deals')
    .insert([deal] as any)
    .select(`
      *,
      contact:crm_contacts(*),
      funnel_stage:crm_funnel_stages(*),
      assigned_to:tryvia_analytics_profiles(id, email)
    `)
    .single();
  
  if (error) throw error;
  return data as CrmDeal;
}

export async function updateDeal(id: string, updates: Partial<CrmDeal>): Promise<CrmDeal> {
  // Remove nested objects before update
  const { contact, funnel_stage, assigned_to, created_by, ...cleanUpdates } = updates;
  
  const { data, error } = await supabase
    .from('crm_deals')
    .update(cleanUpdates as Record<string, unknown>)
    .eq('id', id)
    .select(`
      *,
      contact:crm_contacts(*),
      funnel_stage:crm_funnel_stages(*),
      assigned_to:tryvia_analytics_profiles(id, email)
    `)
    .single();
  
  if (error) throw error;
  return data as CrmDeal;
}

export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_deals')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Tasks
// =============================================

export async function getTasks(clientId: string, dealId?: string, sellerId?: string): Promise<CrmTaskWithContact[]> {
  let query = supabase
    .from('crm_tasks')
    .select(`
      *,
      deal:crm_deals(
        id,
        name,
        contact:crm_contacts(id, name, email, phone, mobile_phone)
      )
    `)
    .eq('client_id', clientId)
    .order('due_date', { ascending: true, nullsFirst: false });
  
  if (dealId) {
    query = query.eq('deal_id', dealId);
  }
  
  // Filter by seller if specified (for crm_user role)
  if (sellerId) {
    query = query.eq('assigned_to_id', sellerId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function bulkDeleteTasks(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('crm_tasks')
    .delete()
    .in('id', ids);
  
  if (error) throw error;
}

export async function createTask(task: Omit<CrmTask, 'id' | 'created_at'>): Promise<CrmTask> {
  const { data, error } = await supabase
    .from('crm_tasks')
    .insert(task)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<CrmTask>): Promise<CrmTask> {
  const { data, error } = await supabase
    .from('crm_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_tasks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Timeline Events
// =============================================

export async function getTimelineEvents(dealId: string): Promise<CrmTimelineEvent[]> {
  const { data, error } = await supabase
    .from('crm_timeline_events')
    .select('id, client_id, deal_id, user_id, event_type, description, metadata, created_at')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as CrmTimelineEvent[];
}

export async function getAllTimelineEvents(clientId: string): Promise<CrmTimelineEvent[]> {
  const { data, error } = await supabase
    .from('crm_timeline_events')
    .select('id, client_id, deal_id, user_id, event_type, description, metadata, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as CrmTimelineEvent[];
}

export async function createTimelineEvent(event: Omit<CrmTimelineEvent, 'id' | 'created_at'>): Promise<CrmTimelineEvent> {
  const { data, error } = await supabase
    .from('crm_timeline_events')
    .insert([{
      client_id: event.client_id,
      deal_id: event.deal_id,
      user_id: event.user_id,
      event_type: event.event_type,
      description: event.description,
      metadata: event.metadata ? JSON.parse(JSON.stringify(event.metadata)) : null,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as CrmTimelineEvent;
}

// =============================================
// Seed default funnel stages for a client
// =============================================

export async function seedDefaultFunnelStages(clientId: string): Promise<CrmFunnelStage[]> {
  // Verificar se já existem etapas para este cliente
  const { data: existingStages, error: checkError } = await supabase
    .from('crm_funnel_stages')
    .select('id')
    .eq('client_id', clientId)
    .limit(1);
  
  if (checkError) throw checkError;
  
  if (existingStages && existingStages.length > 0) {
    throw new Error('Etapas já existem para este cliente. Não é possível criar etapas padrão novamente.');
  }

  const defaultStages = [
    { client_id: clientId, name: 'Novo Lead', order: 1, color: '#3B82F6', is_won: false, is_lost: false },
    { client_id: clientId, name: 'Qualificação', order: 2, color: '#8B5CF6', is_won: false, is_lost: false },
    { client_id: clientId, name: 'Proposta', order: 3, color: '#EC4899', is_won: false, is_lost: false },
    { client_id: clientId, name: 'Negociação', order: 4, color: '#F97316', is_won: false, is_lost: false },
    { client_id: clientId, name: 'Fechado Ganho', order: 5, color: '#10B981', is_won: true, is_lost: false },
    { client_id: clientId, name: 'Fechado Perdido', order: 6, color: '#EF4444', is_won: false, is_lost: true },
  ];

  const { data, error } = await supabase
    .from('crm_funnel_stages')
    .insert(defaultStages)
    .select();
  
  if (error) throw error;
  return data || [];
}

// =============================================
// Funnels
// =============================================

export async function getFunnels(clientId: string): Promise<CrmFunnel[]> {
  const { data, error } = await supabase
    .from('crm_funnels')
    .select('id, client_id, name, description, is_default, created_at')
    .eq('client_id', clientId)
    .order('created_at');
  
  if (error) throw error;
  return data || [];
}

export async function createFunnel(funnel: Omit<CrmFunnel, 'id' | 'created_at'>): Promise<CrmFunnel> {
  const { data, error } = await supabase
    .from('crm_funnels')
    .insert(funnel)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFunnel(id: string, updates: Partial<CrmFunnel>): Promise<CrmFunnel> {
  const { data, error } = await supabase
    .from('crm_funnels')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteFunnel(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_funnels')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function setDefaultFunnel(clientId: string, funnelId: string): Promise<void> {
  // First, unset all funnels as default
  const { error: unsetError } = await supabase
    .from('crm_funnels')
    .update({ is_default: false })
    .eq('client_id', clientId);
  
  if (unsetError) throw unsetError;

  // Then set the selected funnel as default
  const { error: setError } = await supabase
    .from('crm_funnels')
    .update({ is_default: true })
    .eq('id', funnelId);
  
  if (setError) throw setError;
}

// =============================================
// Products
// =============================================

export async function getProducts(clientId: string): Promise<CrmProduct[]> {
  const { data, error } = await supabase
    .from('crm_products')
    .select('id, client_id, code, name, description, unit_price, category, is_active, created_at, updated_at')
    .eq('client_id', clientId)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createProduct(product: Omit<CrmProduct, 'id' | 'created_at' | 'updated_at'>): Promise<CrmProduct> {
  const { data, error } = await supabase
    .from('crm_products')
    .insert(product)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<CrmProduct>): Promise<CrmProduct> {
  const { data, error } = await supabase
    .from('crm_products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_products')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Loss Reasons
// =============================================

export async function getLossReasons(clientId: string): Promise<CrmLossReason[]> {
  const { data, error } = await supabase
    .from('crm_loss_reasons')
    .select('id, client_id, name, description, is_active, created_at, updated_at')
    .eq('client_id', clientId)
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function createLossReason(lossReason: Omit<CrmLossReason, 'id' | 'created_at' | 'updated_at'>): Promise<CrmLossReason> {
  const { data, error } = await supabase
    .from('crm_loss_reasons')
    .insert(lossReason)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateLossReason(id: string, updates: Partial<CrmLossReason>): Promise<CrmLossReason> {
  const { data, error } = await supabase
    .from('crm_loss_reasons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteLossReason(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_loss_reasons')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Custom Field Definitions
// =============================================

export async function getCustomFieldDefinitions(clientId: string, entityType?: string): Promise<CrmCustomFieldDefinition[]> {
  let query = supabase
    .from('crm_custom_field_definitions')
    .select('id, client_id, entity_type, name, field_type, options, is_required, order, created_at, updated_at')
    .eq('client_id', clientId)
    .order('order');
  
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data || []) as CrmCustomFieldDefinition[];
}

export async function createCustomFieldDefinition(
  field: Omit<CrmCustomFieldDefinition, 'id' | 'created_at' | 'updated_at'>
): Promise<CrmCustomFieldDefinition> {
  const { data, error } = await supabase
    .from('crm_custom_field_definitions')
    .insert([field] as any)
    .select()
    .single();
  
  if (error) throw error;
  return data as CrmCustomFieldDefinition;
}

export async function updateCustomFieldDefinition(
  id: string,
  updates: Partial<CrmCustomFieldDefinition>
): Promise<CrmCustomFieldDefinition> {
  const { data, error } = await supabase
    .from('crm_custom_field_definitions')
    .update(updates as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as CrmCustomFieldDefinition;
}

export async function deleteCustomFieldDefinition(id: string): Promise<void> {
  const { error } = await supabase
    .from('crm_custom_field_definitions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// =============================================
// Deal Files
// =============================================

export async function getDealFiles(dealId: string): Promise<CrmDealFile[]> {
  const { data, error } = await supabase
    .from('crm_deal_files')
    .select('id, client_id, deal_id, file_name, file_path, file_size, mime_type, uploaded_by_id, created_at')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as CrmDealFile[];
}

export async function uploadDealFile(
  file: File,
  dealId: string,
  clientId: string,
  userId?: string
): Promise<CrmDealFile> {
  // Upload to storage
  const fileExt = file.name.split('.').pop();
  const filePath = `${clientId}/${dealId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('crm-files')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  // Create file record
  const { data, error: insertError } = await supabase
    .from('crm_deal_files')
    .insert({
      client_id: clientId,
      deal_id: dealId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by_id: userId,
    })
    .select()
    .single();
  
  if (insertError) throw insertError;
  return data as CrmDealFile;
}

export async function deleteDealFile(fileId: string, filePath: string): Promise<void> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('crm-files')
    .remove([filePath]);
  
  if (storageError) throw storageError;
  
  // Delete record
  const { error } = await supabase
    .from('crm_deal_files')
    .delete()
    .eq('id', fileId);
  
  if (error) throw error;
}

export async function getFileDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('crm-files')
    .createSignedUrl(filePath, 3600); // 1 hour expiry
  
  if (error) throw error;
  return data.signedUrl;
}

// =============================================
// Deal Contacts (Many-to-Many)
// =============================================

export interface CrmDealContact {
  id: string;
  deal_id: string;
  contact_id: string;
  is_primary: boolean;
  client_id: string;
  created_at: string;
  contact?: CrmContact;
}

export async function getDealContacts(dealId: string): Promise<CrmDealContact[]> {
  const { data, error } = await supabase
    .from('crm_deal_contacts')
    .select(`
      *,
      contact:crm_contacts(*)
    `)
    .eq('deal_id', dealId)
    .order('is_primary', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addDealContact(dealId: string, contactId: string, clientId: string, isPrimary = false): Promise<CrmDealContact> {
  // If setting as primary, first unset any existing primary
  if (isPrimary) {
    await supabase
      .from('crm_deal_contacts')
      .update({ is_primary: false })
      .eq('deal_id', dealId)
      .eq('is_primary', true);
  }
  
  const { data, error } = await supabase
    .from('crm_deal_contacts')
    .insert({
      deal_id: dealId,
      contact_id: contactId,
      client_id: clientId,
      is_primary: isPrimary,
    })
    .select(`
      *,
      contact:crm_contacts(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeDealContact(dealId: string, contactId: string): Promise<void> {
  const { error } = await supabase
    .from('crm_deal_contacts')
    .delete()
    .eq('deal_id', dealId)
    .eq('contact_id', contactId);
  
  if (error) throw error;
}

export async function setPrimaryDealContact(dealId: string, contactId: string): Promise<void> {
  // First unset all primary
  await supabase
    .from('crm_deal_contacts')
    .update({ is_primary: false })
    .eq('deal_id', dealId);
  
  // Set the new primary
  const { error } = await supabase
    .from('crm_deal_contacts')
    .update({ is_primary: true })
    .eq('deal_id', dealId)
    .eq('contact_id', contactId);
  
  if (error) throw error;
}

// =============================================
// Deal Companies (Many-to-Many)
// =============================================

export interface CrmDealCompany {
  id: string;
  deal_id: string;
  company_id: string;
  is_primary: boolean;
  client_id: string;
  created_at: string;
  company?: CrmCompany;
}

export async function getDealCompanies(dealId: string): Promise<CrmDealCompany[]> {
  const { data, error } = await supabase
    .from('crm_deal_companies')
    .select(`
      *,
      company:crm_companies(*)
    `)
    .eq('deal_id', dealId)
    .order('is_primary', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addDealCompany(dealId: string, companyId: string, clientId: string, isPrimary = false): Promise<CrmDealCompany> {
  // If setting as primary, first unset any existing primary
  if (isPrimary) {
    await supabase
      .from('crm_deal_companies')
      .update({ is_primary: false })
      .eq('deal_id', dealId)
      .eq('is_primary', true);
  }
  
  const { data, error } = await supabase
    .from('crm_deal_companies')
    .insert({
      deal_id: dealId,
      company_id: companyId,
      client_id: clientId,
      is_primary: isPrimary,
    })
    .select(`
      *,
      company:crm_companies(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeDealCompany(dealId: string, companyId: string): Promise<void> {
  const { error } = await supabase
    .from('crm_deal_companies')
    .delete()
    .eq('deal_id', dealId)
    .eq('company_id', companyId);
  
  if (error) throw error;
}

export async function setPrimaryDealCompany(dealId: string, companyId: string): Promise<void> {
  // First unset all primary
  await supabase
    .from('crm_deal_companies')
    .update({ is_primary: false })
    .eq('deal_id', dealId);
  
  // Set the new primary
  const { error } = await supabase
    .from('crm_deal_companies')
    .update({ is_primary: true })
    .eq('deal_id', dealId)
    .eq('company_id', companyId);
  
  if (error) throw error;
}
