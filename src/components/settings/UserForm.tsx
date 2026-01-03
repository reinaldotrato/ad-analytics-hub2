import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserWithRole } from '@/services/usersService';
import { useEffect } from 'react';
import { Mail } from 'lucide-react';

const userSchema = z.object({
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string().optional(),
  clientId: z.string().optional(),
  role: z.enum(['admin', 'analyst', 'user', 'manager', 'seller']),
});

type UserFormData = z.infer<typeof userSchema>;
type RoleType = 'admin' | 'analyst' | 'user' | 'manager' | 'seller';

interface Client {
  id: string;
  name: string;
}

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithRole | null;
  clients: Client[];
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ open, onOpenChange, user, clients, onSubmit, isLoading }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      whatsapp: '',
      clientId: '',
      role: 'user',
    },
  });

  useEffect(() => {
    if (user) {
      // Map legacy roles to new roles for the form
      let mappedRole: RoleType = 'user';
      if (user.role === 'admin') mappedRole = 'admin';
      else if (user.role === 'analyst') mappedRole = 'analyst';
      else if (user.role === 'manager' || user.role === 'crm_admin') mappedRole = 'manager';
      else if (user.role === 'seller' || user.role === 'crm_user') mappedRole = 'seller';
      else mappedRole = 'user';

      form.reset({
        email: user.email || '',
        whatsapp: user.whatsapp || '',
        clientId: user.client_id || '',
        role: mappedRole,
      });
    } else {
      form.reset({
        email: '',
        whatsapp: '',
        clientId: '',
        role: 'user',
      });
    }
  }, [user, form]);

  const handleSubmit = async (data: UserFormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Convidar Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as informações do usuário.' 
              : 'O usuário receberá um email com link para definir sua senha.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@email.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+55 11 99999-0000"
              {...form.register('whatsapp')}
            />
          </div>

          {!isEditing && (
            <>
              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente</Label>
                <Select
                  value={form.watch('clientId') || 'all'}
                  onValueChange={(value) => form.setValue('clientId', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Permissão</Label>
                <Select
                  value={form.watch('role')}
                  onValueChange={(value) => form.setValue('role', value as RoleType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin Master</SelectItem>
                    <SelectItem value="analyst">Analista</SelectItem>
                    <SelectItem value="manager">Gestor</SelectItem>
                    <SelectItem value="seller">Vendedor</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>Um email de convite será enviado automaticamente.</span>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : isEditing ? 'Salvar' : 'Enviar Convite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
