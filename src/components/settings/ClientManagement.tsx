import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ClientsTable } from './ClientsTable';
import { CredentialsTable } from './CredentialsTable';
import { ClientForm } from './ClientForm';
import { CredentialForm } from './CredentialForm';
import { DeleteClientDialog } from './DeleteClientDialog';
import {
  Client,
  ClientCredential,
  getClients,
  createClientWithUser,
  updateClient,
  getClientCredentials,
  createCredential,
  updateCredential,
  deleteCredential,
  uploadClientLogo,
} from '@/services/clientsService';

export function ClientManagement() {
  const queryClient = useQueryClient();
  
  // Client state
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  
  // Credentials state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState<ClientCredential | null>(null);
  const [deletingCredential, setDeletingCredential] = useState<ClientCredential | null>(null);

  // Queries
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const { data: credentials = [], isLoading: isLoadingCredentials } = useQuery({
    queryKey: ['credentials', selectedClient?.id],
    queryFn: () => (selectedClient ? getClientCredentials(selectedClient.id) : Promise.resolve([])),
    enabled: !!selectedClient,
  });

  // Client mutations
  const createClientMutation = useMutation({
    mutationFn: createClientWithUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsClientDialogOpen(false);
      toast.success(`Cliente criado! Convite enviado para ${data.client.email}`);
    },
    onError: (error: Error) => toast.error(error.message || 'Erro ao criar cliente'),
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsClientDialogOpen(false);
      setEditingClient(null);
      toast.success('Cliente atualizado com sucesso');
    },
    onError: () => toast.error('Erro ao atualizar cliente'),
  });

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    setDeletingClient(null);
    toast.success('Cliente excluído com sucesso');
  };

  // Credential mutations
  const createCredentialMutation = useMutation({
    mutationFn: createCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', selectedClient?.id] });
      setIsCredentialDialogOpen(false);
      toast.success('Credencial adicionada com sucesso');
    },
    onError: () => toast.error('Erro ao adicionar credencial'),
  });

  const updateCredentialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientCredential> }) => updateCredential(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', selectedClient?.id] });
      setIsCredentialDialogOpen(false);
      setEditingCredential(null);
      toast.success('Credencial atualizada com sucesso');
    },
    onError: () => toast.error('Erro ao atualizar credencial'),
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: deleteCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials', selectedClient?.id] });
      setDeletingCredential(null);
      toast.success('Credencial excluída com sucesso');
    },
    onError: () => toast.error('Erro ao excluir credencial'),
  });

  // Handlers
  const handleClientSubmit = (data: Omit<Client, 'id' | 'created_at'>) => {
    if (editingClient) {
      // Filter only valid fields for the tryvia_analytics_clients table
      const { name, email, whatsapp_number, company_name, contact_name, address, city, state } = data;
      const cleanedData = { name, email, whatsapp_number, company_name, contact_name, address, city, state };
      updateClientMutation.mutate({ id: editingClient.id, data: cleanedData });
    } else {
      createClientMutation.mutate(data);
    }
  };

  const handleCredentialSubmit = (data: Omit<ClientCredential, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingCredential) {
      updateCredentialMutation.mutate({ id: editingCredential.id, data });
    } else {
      createCredentialMutation.mutate(data);
    }
  };

  const openEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const openEditCredential = (credential: ClientCredential) => {
    setEditingCredential(credential);
    setIsCredentialDialogOpen(true);
  };

  const closeClientDialog = () => {
    setIsClientDialogOpen(false);
    setEditingClient(null);
  };

  const closeCredentialDialog = () => {
    setIsCredentialDialogOpen(false);
    setEditingCredential(null);
  };

  // Credentials view
  if (selectedClient) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle>Credenciais: {selectedClient.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie as credenciais de integração deste cliente
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCredentialDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Credencial
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingCredentials ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <CredentialsTable
              credentials={credentials}
              onEdit={openEditCredential}
              onDelete={setDeletingCredential}
            />
          )}
        </CardContent>

        {/* Credential Dialog */}
        <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCredential ? 'Editar Credencial' : 'Nova Credencial'}
              </DialogTitle>
            </DialogHeader>
            <CredentialForm
              clientId={selectedClient.id}
              credential={editingCredential}
              onSubmit={handleCredentialSubmit}
              onCancel={closeCredentialDialog}
              isLoading={createCredentialMutation.isPending || updateCredentialMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Credential Confirmation */}
        <AlertDialog open={!!deletingCredential} onOpenChange={() => setDeletingCredential(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Credencial</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta credencial? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingCredential && deleteCredentialMutation.mutate(deletingCredential.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  }

  // Clients list view
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Gerenciamento de Clientes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Cadastre e gerencie clientes e suas credenciais de integração
            </p>
          </div>
        </div>
        <Button onClick={() => setIsClientDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingClients ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <ClientsTable
            clients={clients}
            onEdit={openEditClient}
            onDelete={setDeletingClient}
            onManageCredentials={setSelectedClient}
          />
        )}
      </CardContent>

      {/* Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingClient}
            onSubmit={handleClientSubmit}
            onCancel={closeClientDialog}
            isLoading={createClientMutation.isPending || updateClientMutation.isPending}
            onLogoUpload={async (clientId, file) => {
              await uploadClientLogo(clientId, file);
              queryClient.invalidateQueries({ queryKey: ['clients'] });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <DeleteClientDialog
        client={deletingClient}
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        onSuccess={handleDeleteSuccess}
      />
    </Card>
  );
}
