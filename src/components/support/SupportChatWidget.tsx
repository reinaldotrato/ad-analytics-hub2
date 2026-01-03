import { useState, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, X, Paperclip } from 'lucide-react';

interface Attachment {
  file: File;
  name: string;
  size: number;
  uploading: boolean;
  progress: number;
  url?: string;
  error?: string;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function SupportChatWidget() {
  const { user, clientId, selectedClientId } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveClientId = selectedClientId || clientId;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (attachments.length + files.length > MAX_FILES) {
      toast.error(`Máximo de ${MAX_FILES} arquivos permitidos`);
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} excede o limite de 5MB`);
        continue;
      }

      const newAttachment: Attachment = {
        file,
        name: file.name,
        size: file.size,
        uploading: true,
        progress: 0,
      };

      setAttachments(prev => [...prev, newAttachment]);

      try {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${effectiveClientId}/${fileName}`;

        const { error } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        setAttachments(prev => 
          prev.map(a => 
            a.name === file.name 
              ? { ...a, uploading: false, progress: 100, url: urlData.publicUrl }
              : a
          )
        );
      } catch (error) {
        console.error('Upload error:', error);
        setAttachments(prev => 
          prev.map(a => 
            a.name === file.name 
              ? { ...a, uploading: false, error: 'Erro no upload' }
              : a
          )
        );
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (name: string) => {
    setAttachments(prev => prev.filter(a => a.name !== name));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const uploadingFiles = attachments.filter(a => a.uploading);
    if (uploadingFiles.length > 0) {
      toast.error('Aguarde o upload dos arquivos terminar');
      return;
    }

    setLoading(true);

    try {
      const attachmentUrls = attachments
        .filter(a => a.url)
        .map(a => a.url);

      const { error } = await (supabase as any)
        .from('tryvia_analytics_support_tickets')
        .insert({
          client_id: effectiveClientId,
          user_id: user?.id,
          subject: subject.trim(),
          description: description.trim(),
          attachment_url: attachmentUrls[0] || null,
          status: 'open',
        });

      if (error) throw error;

      toast.success('Ticket criado com sucesso! Nossa equipe entrará em contato.');
      setSubject('');
      setDescription('');
      setAttachments([]);
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
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente o problema ou dúvida..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Anexos ({attachments.length}/{MAX_FILES})</Label>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />

            {attachments.length < MAX_FILES && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Adicionar arquivo
              </Button>
            )}

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.name}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                      {attachment.uploading && (
                        <Progress value={attachment.progress} className="h-1 mt-1" />
                      )}
                      {attachment.error && (
                        <p className="text-xs text-destructive">{attachment.error}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeAttachment(attachment.name)}
                      disabled={attachment.uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={openWhatsApp}
              className="flex-1"
              disabled={loading}
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
