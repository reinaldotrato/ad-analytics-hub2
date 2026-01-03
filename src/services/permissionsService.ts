import { supabase } from '@/integrations/supabase/client';

export interface AppFeature {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface AccessGroup {
  id: string;
  client_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  is_system_default: boolean;
  can_see_all_deals: boolean;
  can_see_all_tasks: boolean;
}

export interface GroupPermission {
  id: string;
  group_id: string;
  feature_id: string;
  is_enabled: boolean;
  feature?: AppFeature;
}

export interface UserAccessGroup {
  id: string;
  user_id: string;
  group_id: string;
  group?: AccessGroup;
}

// Buscar todas as features
export async function getFeatures(): Promise<AppFeature[]> {
  const { data, error } = await supabase
    .from('app_features')
    .select('*')
    .order('display_order');

  if (error) throw error;
  return data || [];
}

// Atualizar status de feature
export async function updateFeatureStatus(featureId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('app_features')
    .update({ is_active: isActive })
    .eq('id', featureId);

  if (error) throw error;
}

// Buscar todos os grupos de acesso
export async function getAccessGroups(): Promise<AccessGroup[]> {
  const { data, error } = await supabase
    .from('access_groups')
    .select('*')
    .order('is_system_default', { ascending: false })
    .order('name');

  if (error) throw error;
  return data || [];
}

// Criar grupo de acesso
export async function createAccessGroup(group: Omit<AccessGroup, 'id'>): Promise<AccessGroup> {
  const { data, error } = await supabase
    .from('access_groups')
    .insert(group)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Atualizar grupo de acesso
export async function updateAccessGroup(id: string, updates: Partial<AccessGroup>): Promise<void> {
  const { error } = await supabase
    .from('access_groups')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// Deletar grupo de acesso
export async function deleteAccessGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('access_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Buscar permissões de um grupo
export async function getGroupPermissions(groupId: string): Promise<GroupPermission[]> {
  const { data, error } = await supabase
    .from('group_permissions')
    .select(`
      *,
      feature:app_features(*)
    `)
    .eq('group_id', groupId);

  if (error) throw error;
  return data || [];
}

// Atualizar permissão de um grupo
export async function updateGroupPermission(groupId: string, featureId: string, isEnabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('group_permissions')
    .upsert({
      group_id: groupId,
      feature_id: featureId,
      is_enabled: isEnabled,
    }, {
      onConflict: 'group_id,feature_id'
    });

  if (error) throw error;
}

// Atualizar todas as permissões de um grupo de uma vez
export async function updateGroupPermissions(groupId: string, permissions: { featureId: string; isEnabled: boolean }[]): Promise<void> {
  const records = permissions.map(p => ({
    group_id: groupId,
    feature_id: p.featureId,
    is_enabled: p.isEnabled,
  }));

  const { error } = await supabase
    .from('group_permissions')
    .upsert(records, {
      onConflict: 'group_id,feature_id'
    });

  if (error) throw error;
}

// Buscar grupo de um usuário
export async function getUserAccessGroup(userId: string): Promise<UserAccessGroup | null> {
  const { data, error } = await supabase
    .from('user_access_groups')
    .select(`
      *,
      group:access_groups(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Atribuir usuário a um grupo
export async function assignUserToGroup(userId: string, groupId: string): Promise<void> {
  const { error } = await supabase
    .from('user_access_groups')
    .upsert({
      user_id: userId,
      group_id: groupId,
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
}

// Buscar todos os usuários com seus grupos
export async function getUsersWithGroups(): Promise<Array<{
  user_id: string;
  group_id: string;
  group_name: string;
  group_slug: string;
}>> {
  const { data, error } = await supabase
    .from('user_access_groups')
    .select(`
      user_id,
      group_id,
      group:access_groups(name, slug)
    `);

  if (error) throw error;
  
  return (data || []).map(item => ({
    user_id: item.user_id,
    group_id: item.group_id,
    group_name: (item.group as any)?.name || '',
    group_slug: (item.group as any)?.slug || '',
  }));
}
