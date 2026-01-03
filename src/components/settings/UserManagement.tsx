import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getUsers, updateUserRole, updateUserClient, createUser, updateUser, deleteUser, resetUserPassword, UserWithRole } from '@/services/usersService';
import { getClients } from '@/services/clientsService';
import { UserForm } from './UserForm';
import { Users, Plus, Pencil, Trash2, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const roleLabels: Record<string, string> = {
  admin: 'Admin Master',
  analyst: 'Analista',
  manager: 'Gestor',
  seller: 'Vendedor',
  user: 'Usuário',
  // Legacy roles
  crm_admin: 'Gestor (legado)',
  crm_user: 'Vendedor (legado)',
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  admin: 'default',
  analyst: 'secondary',
  manager: 'default',
  seller: 'outline',
  user: 'outline',
  crm_admin: 'secondary',
  crm_user: 'outline',
};

export function UserManagement() {
  const queryClient = useQueryClient();
  const { selectedClientId, clientId, role } = useAuth();
  const activeClientId = role === 'admin' ? selectedClientId : clientId;
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', activeClientId],
    queryFn: () => getUsers(activeClientId || undefined),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'analyst' | 'user' | 'manager' | 'seller' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', activeClientId] });
      toast.success('Permissão atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar permissão');
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ userId, clientId }: { userId: string; clientId: string | null }) =>
      updateUserClient(userId, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', activeClientId] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar cliente');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', activeClientId] });
      toast.success('Usuário criado com sucesso!');
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: { email: string; whatsapp?: string } }) =>
      updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', activeClientId] });
      toast.success('Usuário atualizado com sucesso!');
      setEditingUser(null);
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', activeClientId] });
      toast.success('Usuário excluído com sucesso!');
      setDeletingUser(null);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => {
      toast.success('Link de redefinição de senha enviado por email!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao resetar senha: ${error.message}`);
    },
  });

  const handleResetPassword = (user: UserWithRole) => {
    resetPasswordMutation.mutate(user.email);
  };

  const handleRoleChange = (userId: string, role: string) => {
    updateRoleMutation.mutate({ userId, role: role as 'admin' | 'analyst' | 'user' | 'manager' | 'seller' });
  };

  const handleClientChange = (userId: string, value: string) => {
    const clientId = value === 'all' ? null : value;
    updateClientMutation.mutate({ userId, clientId });
  };

  const handleFormSubmit = async (data: any) => {
    if (editingUser) {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        data: { email: data.email, whatsapp: data.whatsapp },
      });
    } else {
      await createUserMutation.mutateAsync({
        email: data.email,
        whatsapp: data.whatsapp,
        clientId: data.clientId,
        role: data.role,
      });
    }
  };

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: UserWithRole) => {
    setDeletingUser(user);
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingUser(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando usuários...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <CardDescription>
              Gerencie as permissões de acesso dos usuários do sistema
            </CardDescription>
          </div>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Cliente Atual</TableHead>
                <TableHead>Alterar Cliente</TableHead>
                <TableHead>Permissão Atual</TableHead>
                <TableHead>Alterar Permissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.whatsapp || '—'}</TableCell>
                  <TableCell>{user.client_name || 'Todos'}</TableCell>
                  <TableCell>
                    <Select
                      value={user.client_id || 'all'}
                      onValueChange={(value) => handleClientChange(user.id, value)}
                      disabled={updateClientMutation.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariants[user.role] || 'outline'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin Master</SelectItem>
                        <SelectItem value="analyst">Analista</SelectItem>
                        <SelectItem value="manager">Gestor</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleResetPassword(user)}
                        title="Resetar Senha"
                        disabled={resetPasswordMutation.isPending}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum usuário cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserForm
        open={isFormOpen}
        onOpenChange={handleOpenChange}
        user={editingUser}
        clients={clients}
        onSubmit={handleFormSubmit}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deletingUser?.email}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
