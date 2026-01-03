import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IntegrationCard } from './IntegrationCard';
import { CredentialForm } from './CredentialForm';
import { ClientCredential, createCredential, updateCredential, getClientCredentials } from '@/services/clientsService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AVAILABLE_CHANNELS = [
  { value: 'meta_ads', label: 'Meta Ads', icon: '📘' },
  { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
  { value: 'rd_station', label: 'RD Station', icon: '📊' },
  { value: 'moskit', label: 'Moskit CRM', icon: '💼' },
];

interface IntegrationsPanelProps {
  clientId: string;
}

export function IntegrationsPanel({ clientId }: IntegrationsPanelProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<ClientCredential | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ['credentials', clientId],
    queryFn: () => getClientCredentials(clientId),
    enabled: !!clientId,
  });

  const createMutation = useMutation({
    mutationFn: createCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', clientId] });
      toast.success('Integração adicionada com sucesso');
      setIsFormOpen(false);
    },
    onError: () => toast.error('Erro ao adicionar integração'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientCredential> }) =>
      updateCredential(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', clientId] });
      toast.success('Integração atualizada com sucesso');
      setIsFormOpen(false);
      setEditingCredential(null);
    },
    onError: () => toast.error('Erro ao atualizar integração'),
  });

  const handleTestConnection = async (credential: ClientCredential) => {
    setTestingId(credential.id);
    
    try {
      // Simulated test - update status based on whether we have login/account_id
      const isConfigured = !!credential.login;
      
      const { error } = await supabase
        .from('tryvia_analytics_client_credentials')
        .update({
          connection_status: isConfigured ? 'connected' : 'pending',
          last_sync_at: isConfigured ? new Date().toISOString() : null,
          last_error_message: isConfigured ? null : 'Account ID não configurado',
        })
        .eq('id', credential.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['credentials', clientId] });
      toast.success(isConfigured ? 'Conexão validada com sucesso!' : 'Configuração incompleta');
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingId(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingCredential) {
      updateMutation.mutate({ id: editingCredential.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfigure = (credential: ClientCredential) => {
    setEditingCredential(credential);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingCredential(null);
    setIsFormOpen(true);
  };

  // Get unconfigured channels
  const configuredChannels = credentials.map(c => c.channel);
  const unconfiguredChannels = AVAILABLE_CHANNELS.filter(ch => !configuredChannels.includes(ch.value));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Integrações</CardTitle>
        <Button size="sm" onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configured integrations */}
        <div className="grid gap-4 md:grid-cols-2">
          {credentials.map((credential) => (
            <IntegrationCard
              key={credential.id}
              credential={credential}
              onConfigure={() => handleConfigure(credential)}
              onTest={() => handleTestConnection(credential)}
              isTesting={testingId === credential.id}
            />
          ))}
        </div>

        {/* Unconfigured channels */}
        {unconfiguredChannels.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Integrações disponíveis:</p>
            <div className="flex flex-wrap gap-2">
              {unconfiguredChannels.map((channel) => (
                <Button
                  key={channel.value}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingCredential(null);
                    setIsFormOpen(true);
                  }}
                  className="text-muted-foreground"
                >
                  <span className="mr-2">{channel.icon}</span>
                  {channel.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {credentials.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma integração configurada</p>
            <p className="text-sm">Clique em "Adicionar" para começar</p>
          </div>
        )}
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? 'Editar Integração' : 'Nova Integração'}
            </DialogTitle>
          </DialogHeader>
          <CredentialForm
            clientId={clientId}
            credential={editingCredential}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCredential(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
