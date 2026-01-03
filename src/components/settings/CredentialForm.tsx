import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ClientCredential } from '@/services/clientsService';

const credentialSchema = z.object({
  channel: z.string().min(1, 'Canal é obrigatório'),
  channel_name: z.string().max(100).optional().or(z.literal('')),
  url: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
  login: z.string().max(255).optional().or(z.literal('')),
  password_encrypted: z.string().max(255).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  n8n_workflow_url: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
});

type CredentialFormData = z.infer<typeof credentialSchema>;

const CHANNEL_OPTIONS = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'rd_station', label: 'RD Station' },
  { value: 'moskit', label: 'Moskit CRM' },
  { value: 'google_analytics', label: 'Google Analytics' },
  { value: 'other', label: 'Outro' },
];

// Configuração dinâmica de campos por canal
const CHANNEL_FIELD_CONFIG: Record<string, {
  loginLabel: string;
  loginPlaceholder: string;
  loginHelper: string;
  showPassword: boolean;
  showUrl: boolean;
}> = {
  meta_ads: {
    loginLabel: 'Account ID',
    loginPlaceholder: '1151293266731699',
    loginHelper: 'ID da conta de anúncios no Meta Business Suite',
    showPassword: false,
    showUrl: false,
  },
  google_ads: {
    loginLabel: 'Customer ID (MCC)',
    loginPlaceholder: '123-456-7890',
    loginHelper: 'ID do cliente no Google Ads Manager (com hífens)',
    showPassword: false,
    showUrl: false,
  },
  rd_station: {
    loginLabel: 'API Key',
    loginPlaceholder: 'chave-api-rd-station',
    loginHelper: 'Chave de API disponível nas configurações do RD Station',
    showPassword: true,
    showUrl: true,
  },
  moskit: {
    loginLabel: 'Token de Acesso',
    loginPlaceholder: 'seu_token_aqui',
    loginHelper: 'Token de integração nas configurações do Moskit',
    showPassword: true,
    showUrl: true,
  },
  google_analytics: {
    loginLabel: 'Property ID',
    loginPlaceholder: 'UA-XXXXX-Y ou G-XXXXXXX',
    loginHelper: 'ID da propriedade do Google Analytics',
    showPassword: false,
    showUrl: false,
  },
  other: {
    loginLabel: 'Login/Usuário',
    loginPlaceholder: 'usuário ou e-mail',
    loginHelper: '',
    showPassword: true,
    showUrl: true,
  },
};

interface CredentialFormProps {
  clientId: string;
  credential?: ClientCredential | null;
  onSubmit: (data: CredentialFormData & { client_id: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CredentialForm({ clientId, credential, onSubmit, onCancel, isLoading }: CredentialFormProps) {
  const form = useForm<CredentialFormData>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      channel: credential?.channel || '',
      channel_name: credential?.channel_name || '',
      url: credential?.url || '',
      login: credential?.login || '',
      password_encrypted: credential?.password_encrypted || '',
      notes: credential?.notes || '',
      n8n_workflow_url: credential?.n8n_workflow_url || '',
    },
  });

  const selectedChannel = form.watch('channel');
  const fieldConfig = CHANNEL_FIELD_CONFIG[selectedChannel] || CHANNEL_FIELD_CONFIG.other;

  const handleSubmit = (data: CredentialFormData) => {
    onSubmit({
      ...data,
      client_id: clientId,
      channel_name: data.channel_name || null,
      url: data.url || null,
      login: data.login || null,
      password_encrypted: data.password_encrypted || null,
      notes: data.notes || null,
      n8n_workflow_url: data.n8n_workflow_url || null,
    } as CredentialFormData & { client_id: string });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal/Integração *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="channel_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Conta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Conta Principal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Campo de Login/ID dinâmico */}
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem className={fieldConfig.showPassword ? '' : 'md:col-span-2'}>
                <FormLabel>{fieldConfig.loginLabel}</FormLabel>
                <FormControl>
                  <Input placeholder={fieldConfig.loginPlaceholder} {...field} />
                </FormControl>
                {fieldConfig.loginHelper && (
                  <p className="text-xs text-muted-foreground">{fieldConfig.loginHelper}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Senha - condicional */}
          {fieldConfig.showPassword && (
            <FormField
              control={form.control}
              name="password_encrypted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha/Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Campo de URL - condicional */}
          {fieldConfig.showUrl && (
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>URL de Acesso</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="n8n_workflow_url"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>URL do Workflow N8N</FormLabel>
                <FormControl>
                  <Input placeholder="https://n8n.srv1079794.hstgr.cloud/workflow/..." {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">Link do workflow N8N responsável por sincronizar este canal</p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notas adicionais sobre esta credencial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : credential ? 'Atualizar' : 'Adicionar Credencial'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
