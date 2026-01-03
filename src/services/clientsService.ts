import { supabase } from '@/integrations/supabase/client';

export interface Client {
  id: string;
  name: string;
  email: string | null;
  whatsapp_number: string | null;
  company_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  contact_name: string | null;
  created_at: string | null;
  logo_url: string | null;
}

export interface ClientCredential {
  id: string;
  client_id: string;
  channel: string;
  channel_name: string | null;
  url: string | null;
  login: string | null;
  password_encrypted: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  connection_status: string | null;
  last_sync_at: string | null;
  n8n_workflow_url: string | null;
  last_error_message: string | null;
}

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('tryvia_analytics_clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('tryvia_analytics_clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) throw error;
  return data;
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const { data, error } = await supabase
    .from('tryvia_analytics_clients')
    .insert(client)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface ClientCredentialsInput {
  googleAdsCustomerId?: string;
  metaAdsAccountId?: string;
  rdStationApiToken?: string;
  n8nWebhookUrl?: string;
}

export interface CreateClientWithUserResult {
  client: Client;
  userId: string;
  tablePrefix: string;
  isExistingUser: boolean;
  message: string;
}

export async function createClientWithUser(
  client: Omit<Client, 'id' | 'created_at'>,
  credentials?: ClientCredentialsInput
): Promise<CreateClientWithUserResult> {
  const { data, error } = await supabase.functions.invoke('create-client-with-user', {
    body: { ...client, credentials },
  });

  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

export async function updateClient(clientId: string, client: Partial<Omit<Client, 'id' | 'created_at'>>): Promise<Client> {
  const { data, error } = await supabase
    .from('tryvia_analytics_clients')
    .update(client)
    .eq('id', clientId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('tryvia_analytics_clients')
    .delete()
    .eq('id', clientId);

  if (error) throw error;
}

export interface DeletionSummary {
  tables: string[];
  users: { id: string; email: string }[];
  credentials: number;
  crmData: {
    deals: number;
    contacts: number;
    companies: number;
    tasks: number;
    funnels: number;
    products: number;
  };
}

export interface DeleteClientPreview {
  client: Client;
  summary: DeletionSummary;
}

export async function getClientDeletionPreview(clientId: string): Promise<DeleteClientPreview> {
  const { data, error } = await supabase.functions.invoke('delete-client-complete', {
    body: { clientId, action: 'preview' },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function deleteClientComplete(clientId: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.functions.invoke('delete-client-complete', {
    body: { clientId },
  });

  if (error) throw error;
  if (data.error) throw new Error(data.error);
  return data;
}

// Credentials
export async function getClientCredentials(clientId: string): Promise<ClientCredential[]> {
  const { data, error } = await supabase
    .from('tryvia_analytics_client_credentials')
    .select('*')
    .eq('client_id', clientId)
    .order('channel', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCredential(credential: Omit<ClientCredential, 'id' | 'created_at' | 'updated_at'>): Promise<ClientCredential> {
  const { data, error } = await supabase
    .from('tryvia_analytics_client_credentials')
    .insert(credential)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCredential(credentialId: string, credential: Partial<Omit<ClientCredential, 'id' | 'created_at' | 'updated_at'>>): Promise<ClientCredential> {
  const { data, error } = await supabase
    .from('tryvia_analytics_client_credentials')
    .update(credential)
    .eq('id', credentialId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCredential(credentialId: string): Promise<void> {
  const { error } = await supabase
    .from('tryvia_analytics_client_credentials')
    .delete()
    .eq('id', credentialId);

  if (error) throw error;
}

// Upload client logo to storage
export async function uploadClientLogo(clientId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filePath = `client-logos/${clientId}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('assets')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type 
    });
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(filePath);
  
  // Update client with logo URL
  await updateClient(clientId, { logo_url: publicUrl });
  
  return publicUrl;
}
