import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Upload, X, Building2 } from 'lucide-react';
import { Client } from '@/services/clientsService';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido').max(255),
  whatsapp_number: z.string().max(20).optional().or(z.literal('')),
  company_name: z.string().max(100).optional().or(z.literal('')),
  contact_name: z.string().max(100).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(2).optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  onLogoUpload?: (clientId: string, file: File) => Promise<void>;
}

export function ClientForm({ client, onSubmit, onCancel, isLoading, onLogoUpload }: ClientFormProps) {
  const isEditing = !!client;
  const [logoPreview, setLogoPreview] = useState<string | null>(client?.logo_url || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || '',
      email: client?.email || '',
      whatsapp_number: client?.whatsapp_number || '',
      company_name: client?.company_name || '',
      contact_name: client?.contact_name || '',
      address: client?.address || '',
      city: client?.city || '',
      state: client?.state || '',
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Formato inválido. Use PNG, JPG ou WEBP.');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (data: ClientFormData) => {
    // If editing and there's a new logo file, upload it first
    if (isEditing && logoFile && client?.id && onLogoUpload) {
      try {
        setIsUploadingLogo(true);
        await onLogoUpload(client.id, logoFile);
        toast.success('Logo atualizado com sucesso!');
      } catch (error) {
        toast.error('Erro ao fazer upload do logo');
        console.error('Logo upload error:', error);
      } finally {
        setIsUploadingLogo(false);
      }
    }
    
    onSubmit({
      ...data,
      email: data.email || null,
      whatsapp_number: data.whatsapp_number || null,
      company_name: data.company_name || null,
      contact_name: data.contact_name || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      // Pass logoFile for new client creation
      ...(logoFile && !isEditing ? { _logoFile: logoFile } : {}),
    } as ClientFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Logo Upload Section */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/30 flex items-center justify-center cursor-pointer transition-colors overflow-hidden group"
            >
              {logoPreview ? (
                <>
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo();
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Building2 className="h-6 w-6 mb-1" />
                  <Upload className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">Logo</p>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Contato</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do contato principal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} disabled={isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, número, bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="SP" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            <span>Um convite será enviado automaticamente para o email do contato com acesso ao dashboard.</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
