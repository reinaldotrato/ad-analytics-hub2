import { useState } from 'react';
import { ClientManagement } from '@/components/settings/ClientManagement';
import { UserManagement } from '@/components/settings/UserManagement';
import { IntegrationsPanel } from '@/components/settings/IntegrationsPanel';
import { PermissionsTab } from '@/components/settings/PermissionsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database, Loader2, Shield } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const { selectedClientId, clientId, role } = useAuth();
  const activeClientId = role === 'admin' ? selectedClientId : clientId;
  const [isSeeding, setIsSeeding] = useState(false);
  const queryClient = useQueryClient();

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data', {
        method: 'POST'
      });
      
      if (error) {
        console.error('Seed error:', error);
        toast.error('Erro ao popular dados demo: ' + error.message);
        return;
      }
      
      // Invalidar todos os caches relevantes para forçar reload dos dados
      await queryClient.invalidateQueries({ queryKey: ['consolidated-kpis'] });
      await queryClient.invalidateQueries({ queryKey: ['pipeline-metrics'] });
      await queryClient.invalidateQueries({ queryKey: ['crm-funnel-metrics'] });
      await queryClient.invalidateQueries({ queryKey: ['meta-kpis'] });
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      
      toast.success(`Dados demo gerados com sucesso! ${data?.counts?.meta_campaigns || 0} campanhas, ${data?.counts?.rd_leads || 0} leads, ${data?.counts?.crm_deals || 0} deals`);
    } catch (err: any) {
      console.error('Seed error:', err);
      toast.error('Erro ao popular dados demo');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie clientes, usuários e configurações do sistema</p>
        </div>
        
        {role === 'admin' && selectedClientId === 'de000000-0000-4000-a000-000000000001' && (
          <Button 
            onClick={handleSeedDemoData} 
            disabled={isSeeding}
            variant="outline"
            className="gap-2"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {isSeeding ? 'Gerando dados...' : 'Gerar Dados Demo'}
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="h-4 w-4" />
            Permissões
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="mt-4">
          {activeClientId ? (
            <IntegrationsPanel clientId={activeClientId} />
          ) : (
            <p className="text-muted-foreground">Selecione um cliente para ver as integrações</p>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="clients" className="mt-4">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <PermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
