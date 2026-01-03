import { supabase } from '@/integrations/supabase/client';

export interface UserWithRole {
  id: string;
  email: string;
  whatsapp: string | null;
  client_id: string | null;
  client_name: string | null;
  role: 'admin' | 'analyst' | 'user' | 'manager' | 'seller' | 'crm_admin' | 'crm_user';
}

export async function getUsers(clientId?: string): Promise<UserWithRole[]> {
  // Buscar profiles - filtrar por client_id se fornecido
  let query = supabase
    .from('tryvia_analytics_profiles')
    .select('id, email, client_id, whatsapp');
  
  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data: profiles, error: profilesError } = await query;

  if (profilesError) throw profilesError;

  // Buscar roles
  const { data: roles, error: rolesError } = await supabase
    .from('tryvia_analytics_user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  // Buscar clientes
  const { data: clients, error: clientsError } = await supabase
    .from('tryvia_analytics_clients')
    .select('id, name');

  if (clientsError) throw clientsError;

  // Mapear dados
  const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
  const clientsMap = new Map(clients?.map(c => [c.id, c.name]) || []);

  return (profiles || []).map(profile => ({
    id: profile.id,
    email: profile.email,
    whatsapp: profile.whatsapp || null,
    client_id: profile.client_id,
    client_name: profile.client_id ? clientsMap.get(profile.client_id) || null : null,
    role: (rolesMap.get(profile.id) as 'admin' | 'analyst' | 'user' | 'manager' | 'seller' | 'crm_admin' | 'crm_user') || 'user',
  }));
}

export async function updateUserRole(userId: string, newRole: 'admin' | 'analyst' | 'user' | 'manager' | 'seller'): Promise<void> {
  // Verificar se já existe role
  const { data: existingRole } = await supabase
    .from('tryvia_analytics_user_roles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existingRole) {
    // Atualizar
    const { error } = await supabase
      .from('tryvia_analytics_user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    // Inserir
    const { error } = await supabase
      .from('tryvia_analytics_user_roles')
      .insert({ user_id: userId, role: newRole });

    if (error) throw error;
  }
}

export async function updateUserClient(userId: string, clientId: string | null): Promise<void> {
  const { error } = await supabase
    .from('tryvia_analytics_profiles')
    .update({ client_id: clientId })
    .eq('id', userId);

  if (error) throw error;
}

export interface CreateUserData {
  email: string;
  whatsapp?: string;
  clientId?: string;
  role: 'admin' | 'analyst' | 'user' | 'manager' | 'seller';
}

export async function createUser(data: CreateUserData): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('manage-user', {
    body: {
      action: 'create',
      email: data.email,
      whatsapp: data.whatsapp || null,
      clientId: data.clientId || null,
      role: data.role,
    },
  });

  if (response.error) throw response.error;
  if (response.data?.error) throw new Error(response.data.error);
}

export interface UpdateUserData {
  email: string;
  whatsapp?: string;
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('manage-user', {
    body: {
      action: 'update',
      userId,
      email: data.email,
      whatsapp: data.whatsapp || null,
    },
  });

  if (response.error) throw response.error;
  if (response.data?.error) throw new Error(response.data.error);
}

export async function deleteUser(userId: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('manage-user', {
    body: {
      action: 'delete',
      userId,
    },
  });

  if (response.error) throw response.error;
  if (response.data?.error) throw new Error(response.data.error);
}

export async function resetUserPassword(email: string): Promise<{ actionLink?: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  const response = await supabase.functions.invoke('manage-user', {
    body: {
      action: 'reset-password',
      email,
    },
  });

  if (response.error) throw response.error;
  if (response.data?.error) throw new Error(response.data.error);
  
  return { actionLink: response.data?.actionLink };
}
