import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPermissions {
  permissions: string[];
  groupId: string | null;
  groupName: string | null;
  groupSlug: string | null;
  canSeeAllDeals: boolean;
  canSeeAllTasks: boolean;
  loading: boolean;
}

export function usePermissions(): UserPermissions {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [groupInfo, setGroupInfo] = useState<{
    groupId: string | null;
    groupName: string | null;
    groupSlug: string | null;
    canSeeAllDeals: boolean;
    canSeeAllTasks: boolean;
  }>({
    groupId: null,
    groupName: null,
    groupSlug: null,
    canSeeAllDeals: false,
    canSeeAllTasks: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setGroupInfo({
        groupId: null,
        groupName: null,
        groupSlug: null,
        canSeeAllDeals: false,
        canSeeAllTasks: false,
      });
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      setLoading(true);
      try {
        // Buscar permissões do usuário
        const { data: permsData } = await supabase
          .rpc('get_user_permissions', { _user_id: user.id });

        const enabledPerms = (permsData || [])
          .filter((p: { is_enabled: boolean }) => p.is_enabled)
          .map((p: { feature_slug: string }) => p.feature_slug);

        setPermissions(enabledPerms);

        // Buscar info do grupo
        const { data: groupData } = await supabase
          .rpc('get_user_group_info', { _user_id: user.id });

        if (groupData && groupData.length > 0) {
          const group = groupData[0];
          setGroupInfo({
            groupId: group.group_id,
            groupName: group.group_name,
            groupSlug: group.group_slug,
            canSeeAllDeals: group.can_see_all_deals,
            canSeeAllTasks: group.can_see_all_tasks,
          });
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  return {
    permissions,
    ...groupInfo,
    loading,
  };
}

// Helper para verificar permissão específica
export function hasPermission(permissions: string[], feature: string): boolean {
  return permissions.includes(feature);
}

// Feature slugs como constantes
export const FEATURES = {
  GLOBAL_VIEW: 'global_view',
  DASHBOARD_COMPLETE: 'dashboard_complete',
  DASHBOARD_EXECUTIVE: 'dashboard_executive',
  EXPORT_DASHBOARD: 'export_dashboard',
  CRM_PIPELINE: 'crm_pipeline',
  CRM_REPORTS: 'crm_reports',
  CRM_CONTACTS: 'crm_contacts',
  CRM_COMPANIES: 'crm_companies',
  CRM_CALENDAR: 'crm_calendar',
  CRM_GOALS: 'crm_goals',
  CRM_PRODUCTIVITY: 'crm_productivity',
  CRM_SETTINGS: 'crm_settings',
  SUPPORT_TICKETS: 'support_tickets',
  APP_SETTINGS: 'app_settings',
} as const;
