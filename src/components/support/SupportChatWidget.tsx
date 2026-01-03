import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, Upload } from 'lucide-react';

export function SupportChatWidget() {
  const { user, clientId } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      let attachmentUrl = null;

      // Upload file if exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `support/${clientId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('attachments')
            .getPublicUrl(filePath);
          attachmentUrl = urlData.publicUrl;
        }
      }

      // Create support ticket - use any to bypass strict typing
      const { error } = await (supabase as any)
        .from('tryvia_analytics_support_tickets')
        .insert({
          client_id: clientId,
          user_id: user?.id,
          subject: formData.subject,
          description: formData.description,
          attachment_url: attachmentUrl,
          status: 'open',
        });

      if (error) throw error;

      toast.success('Ticket criado com sucesso! Nossa equipe entrará em contato.');
      setFormData({ subject: '', description: '' });
      setFile(null);
      setOpen(false);

    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao criar ticket. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const phone = '5511999999999'; // Replace with actual support number
    const message = encodeURIComponent('Olá! Preciso de ajuda com a plataforma Tryvia Analytics.');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#25D366] hover:bg-[#20BD5A] text-white z-50"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Suporte Tryvia</SheetTitle>
          <SheetDescription>
            Envie sua dúvida ou problema e nossa equipe entrará em contato.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              placeholder="Resumo do problema"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o problema ou dúvida..."
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Anexo (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : 'Selecionar arquivo'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={openWhatsApp}
              className="flex-1"
            >
              <WhatsAppIcon className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
