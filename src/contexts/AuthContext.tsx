import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { preloadClientTables, clearTableCache } from '@/services/clientTableRegistry';

export type UserRole = 'admin' | 'analyst' | 'user' | 'crm_admin' | 'crm_user' | 'manager' | 'seller';

// Interface para permissões do usuário
export interface UserPermissions {
  permissions: string[];
  groupId: string | null;
  groupName: string | null;
  groupSlug: string | null;
  canSeeAllDeals: boolean;
  canSeeAllTasks: boolean;
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

// Helper functions for role checking (legacy - mantidos para compatibilidade)
export const isSeller = (role: UserRole | null) => 
  role === 'seller' || role === 'crm_user';

export const isManager = (role: UserRole | null) => 
  role === 'manager' || role === 'crm_admin';

export const canAccessDashboards = (role: UserRole | null) => 
  ['admin', 'analyst', 'manager', 'crm_admin'].includes(role || '');

export const canAccessCrm = (role: UserRole | null) => 
  ['admin', 'manager', 'crm_admin', 'seller', 'crm_user'].includes(role || '');

export const canAccessCrmSettings = (role: UserRole | null) => 
  ['admin', 'manager', 'crm_admin'].includes(role || '');

export const canAccessCrmAdvanced = (role: UserRole | null) => 
  ['admin', 'manager', 'crm_admin'].includes(role || '');

export const canAccessGlobalView = (role: UserRole | null) => 
  role === 'admin';

export const canAccessSupport = (role: UserRole | null) => 
  role === 'admin';

export const canAccessAppSettings = (role: UserRole | null) => 
  role === 'admin';

export const isCrmOnlyRole = (role: UserRole | null) => 
  isSeller(role);

export const canAccessFullDashboard = (role: UserRole | null) => 
  canAccessDashboards(role);

// Helper para verificar permissão por slug
export const hasPermission = (permissions: string[], feature: string): boolean => 
  permissions.includes(feature);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  clientId: string | null;
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
  role: UserRole | null;
  loading: boolean;
  // Novas propriedades de permissões dinâmicas
  permissions: string[];
  groupInfo: {
    groupId: string | null;
    groupName: string | null;
    groupSlug: string | null;
    canSeeAllDeals: boolean;
    canSeeAllTasks: boolean;
  };
  hasFeature: (feature: string) => boolean;
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, clientName: string, whatsappNumber?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [tablesPreloaded, setTablesPreloaded] = useState(false);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [groupInfo, setGroupInfo] = useState({
    groupId: null as string | null,
    groupName: null as string | null,
    groupSlug: null as string | null,
    canSeeAllDeals: false,
    canSeeAllTasks: false,
  });
  const navigate = useNavigate();

  // Helper para verificar permissão
  const hasFeature = useCallback((feature: string) => {
    return permissions.includes(feature);
  }, [permissions]);

  // Preload table cache when effective client changes
  useEffect(() => {
    const effectiveId = role === 'admin' ? selectedClientId : clientId;
    if (effectiveId) {
      clearTableCache();
      setTablesPreloaded(false);
      preloadClientTables(effectiveId).then(() => {
        setTablesPreloaded(true);
      });
    }
  }, [clientId, selectedClientId, role]);

  const fetchUserData = async (userId: string) => {
    try {
      // Executar todas as queries em paralelo para melhor performance
      const [roleResult, profileResult, permsResult, groupResult] = await Promise.all([
        supabase
          .from('tryvia_analytics_user_roles')
          .select('role')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('tryvia_analytics_profiles')
          .select('client_id')
          .eq('id', userId)
          .single(),
        supabase.rpc('get_user_permissions', { _user_id: userId }),
        supabase.rpc('get_user_group_info', { _user_id: userId }),
      ]);

      // Processar role
      if (roleResult.data) {
        setRole(roleResult.data.role as UserRole);
      }

      // Processar client_id
      if (profileResult.data) {
        setClientId(profileResult.data.client_id);
        if (roleResult.data?.role !== 'admin') {
          setSelectedClientId(profileResult.data.client_id);
        }
      }

      // Processar permissões
      const enabledPerms = (permsResult.data || [])
        .filter((p: { is_enabled: boolean }) => p.is_enabled)
        .map((p: { feature_slug: string }) => p.feature_slug);
      setPermissions(enabledPerms);

      // Processar info do grupo
      if (groupResult.data && groupResult.data.length > 0) {
        const group = groupResult.data[0];
        setGroupInfo({
          groupId: group.group_id,
          groupName: group.group_name,
          groupSlug: group.group_slug,
          canSeeAllDeals: group.can_see_all_deals,
          canSeeAllTasks: group.can_see_all_tasks,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setClientId(null);
          setSelectedClientId(null);
          setRole(null);
          setPermissions([]);
          setGroupInfo({
            groupId: null,
            groupName: null,
            groupSlug: null,
            canSeeAllDeals: false,
            canSeeAllTasks: false,
          });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          await fetchUserData(session.user.id);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, clientName: string, whatsappNumber?: string) => {
    // Signup simplificado - trigger no banco cria cliente, profile e role automaticamente
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          client_name: clientName,
          whatsapp_number: whatsappNumber,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        clientId, 
        selectedClientId, 
        setSelectedClientId, 
        role, 
        loading,
        permissions,
        groupInfo,
        hasFeature,
        signIn, 
        signUp, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
