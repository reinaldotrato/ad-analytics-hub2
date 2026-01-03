import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Mail, Phone, Calendar, FileText, User, FolderOpen, ExternalLink } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { DetailData, DetailEntityType } from '../../hooks/useDetailData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCreateTimelineEvent } from '@/hooks/useCrmData';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DetailCenterPanelProps {
  type: DetailEntityType;
  data: DetailData;
}

export function DetailCenterPanel({ type, data }: DetailCenterPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'nota' | 'atividade'>('nota');
  const [noteText, setNoteText] = useState('');
  const [activityType, setActivityType] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const createTimelineEvent = useCreateTimelineEvent();

  const getTimelineIcon = (eventType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      note: <FileText size={16} className="text-blue-500" />,
      email: <Mail size={16} className="text-green-500" />,
      whatsapp: <Phone size={16} className="text-emerald-500" />,
      call: <Phone size={16} className="text-yellow-500" />,
      meeting: <Calendar size={16} className="text-purple-500" />,
      contact_added: <User size={16} className="text-cyan-500" />,
      status_changed: <FolderOpen size={16} className="text-orange-500" />,
      stage_changed: <FolderOpen size={16} className="text-orange-500" />,
      deal_created: <FileText size={16} className="text-primary" />,
    };
    return iconMap[eventType] || <FileText size={16} className="text-muted-foreground" />;
  };

  const formatEventDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd 'de' MMM, HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  // Timeline filtrada para mostrar apenas notas
  const notesTimeline = data.timeline?.filter(event => event.event_type === 'note') || [];
  
  // Comunicações (email e whatsapp)
  const communicationsTimeline = data.timeline?.filter(event => 
    ['email', 'whatsapp'].includes(event.event_type)
  ) || [];

  const handleSave = async () => {
    if (!noteText.trim()) {
      toast.error('Digite algo para salvar');
      return;
    }

    if (type !== 'deal') {
      toast.error('Notas só podem ser adicionadas em negócios');
      return;
    }

    setIsSaving(true);
    
    type TimelineEventType = 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task_completed' | 'visit' | 'whatsapp';
    const eventType: TimelineEventType = activeTab === 'nota' ? 'note' : ((activityType || 'note') as TimelineEventType);
    const description = activeTab === 'atividade' && activityType 
      ? `[${activityType.toUpperCase()}] ${noteText}`
      : noteText;

    createTimelineEvent.mutate(
      {
        deal_id: data.id,
        event_type: eventType,
        description: description,
        user_id: user?.id,
      },
      {
        onSuccess: () => {
          toast.success(activeTab === 'nota' ? 'Nota salva' : 'Atividade registrada');
          setNoteText('');
          setActivityType('');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
        onError: () => {
          toast.error('Erro ao salvar');
        },
        onSettled: () => {
          setIsSaving(false);
        },
      }
    );
  };

  const handleEmailClick = () => {
    const email = data.contact?.email || data.email;
    if (email) {
      window.open(`mailto:${email}`, '_blank');
      // Registrar comunicação
      if (type === 'deal') {
        createTimelineEvent.mutate({
          deal_id: data.id,
          event_type: 'email',
          description: `Email iniciado para ${email}`,
          user_id: user?.id,
        }, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
          }
        });
      }
    } else {
      toast.error('Nenhum email cadastrado');
    }
  };

  const handleWhatsAppClick = () => {
    const phone = data.contact?.phone || data.contact?.mobile_phone || data.phone;
    
    // Always register the communication attempt (even without phone)
    if (type === 'deal') {
      const description = phone 
        ? `WhatsApp iniciado para ${phone}`
        : 'Tentativa de contato via WhatsApp - telefone não cadastrado';
      
      createTimelineEvent.mutate({
        deal_id: data.id,
        event_type: 'whatsapp',
        description,
        user_id: user?.id,
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        }
      });
    }
    
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      toast.error('Nenhum telefone cadastrado para este contato');
    }
  };

  return (
    <div className="space-y-4">
      {/* Seção de Notas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab('nota')}
              className={`pb-2 font-medium text-sm transition-colors ${
                activeTab === 'nota'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Nota
            </button>
            <button
              onClick={() => setActiveTab('atividade')}
              className={`pb-2 font-medium text-sm transition-colors ${
                activeTab === 'atividade'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Atividade Realizada
            </button>
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="Escreva o que aconteceu..."
              className="min-h-24 resize-none"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />

            <div className="flex items-center gap-2">
              {activeTab === 'atividade' && (
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Tipo de atividade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Chamada</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="visit">Visita</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Button 
                className="flex-shrink-0" 
                onClick={handleSave}
                disabled={isSaving || !noteText.trim()}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>

          {/* Aviso de Risco */}
          {type === 'deal' && (!data.tasks || data.tasks.length === 0) && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-900 dark:text-amber-200 font-medium">
                  O risco de esquecer do cliente sem uma atividade agendada é alto
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                  Mantenha pelo menos uma atividade por negócio.
                </p>
                <Button variant="link" className="h-auto p-0 text-amber-600 text-xs mt-1">
                  Criar nova atividade
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Comunicações */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Comunicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-primary/10 text-primary hover:bg-primary/20"
              onClick={handleEmailClick}
            >
              <Mail size={16} className="mr-2" />
              Email
              <ExternalLink size={12} className="ml-1" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleWhatsAppClick}
            >
              <WhatsAppIcon size={16} className="mr-2 text-[#25D366]" />
              Whatsapp
              <ExternalLink size={12} className="ml-1" />
            </Button>
          </div>
          
          {communicationsTimeline.length > 0 ? (
            <div className="space-y-3">
              {communicationsTimeline.slice(0, 5).map((event) => (
                <div key={event.id} className="flex gap-3 pb-3 border-b border-border last:border-b-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getTimelineIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground break-words">{event.description}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatEventDate(event.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">Nenhuma comunicação registrada</p>
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-sm text-foreground font-medium">Registre emails e WhatsApp trocados</p>
                <p className="text-sm text-muted-foreground">Clique nos botões acima para iniciar uma comunicação</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Linha do Tempo - Apenas Notas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Timeline Events */}
          <div className="space-y-4">
            {notesTimeline.length > 0 ? (
              notesTimeline.map((event) => (
                <div key={event.id} className="flex gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getTimelineIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground break-words">{event.description}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {formatEventDate(event.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma nota registrada
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DetailCenterPanel;
