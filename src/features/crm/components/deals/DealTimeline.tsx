import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';
import type { CrmTimelineEvent } from '@/services/crmService';

interface DealTimelineProps {
  timeline: CrmTimelineEvent[];
}

const eventIcons: Record<string, React.ReactNode> = {
  note: <MessageSquare className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  stage_change: <ArrowRightLeft className="h-4 w-4" />,
  task_completed: <CheckCircle2 className="h-4 w-4" />,
};

const eventColors: Record<string, string> = {
  note: 'bg-blue-500/10 text-blue-500',
  call: 'bg-green-500/10 text-green-500',
  email: 'bg-purple-500/10 text-purple-500',
  meeting: 'bg-orange-500/10 text-orange-500',
  stage_change: 'bg-pink-500/10 text-pink-500',
  task_completed: 'bg-emerald-500/10 text-emerald-500',
};

const eventLabels: Record<string, string> = {
  note: 'Nota',
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  stage_change: 'Mudança de Etapa',
  task_completed: 'Tarefa Concluída',
};

export function DealTimeline({ timeline }: DealTimelineProps) {
  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Timeline</CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade registrada
          </p>
        ) : (
          <div className="relative space-y-4">
            {/* Linha vertical conectando os eventos */}
            <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />

            {timeline.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${eventColors[event.event_type]}`}
                >
                  {eventIcons[event.event_type]}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {eventLabels[event.event_type]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      • {formatDate(event.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">{event.description}</p>
                  {event.user_id && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Usuário: {event.user_id.slice(0, 8)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
