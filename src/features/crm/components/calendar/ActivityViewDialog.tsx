import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Phone,
  Mail,
  Users,
  CheckSquare,
  CalendarIcon,
  CheckCircle2,
  Pencil,
  Trash2,
  Clock,
  Briefcase,
  User,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface CalendarActivity {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'call' | 'meeting' | 'email' | 'whatsapp';
  dealId?: string;
  dealName?: string;
  description?: string;
  completed?: boolean;
  assignedTo?: string;
  durationMinutes?: number;
  contactId?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface ActivityViewDialogProps {
  activity: CalendarActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (activityId: string) => void;
  onPostpone?: (activityId: string, newDate: Date) => void;
  onEdit?: (activity: CalendarActivity) => void;
  onDelete?: (activityId: string) => void;
}

const eventTypeLabels: Record<string, string> = {
  task: 'Tarefa',
  call: 'Ligação',
  meeting: 'Reunião',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
};

const eventTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  task: CheckSquare,
  call: Phone,
  meeting: Users,
  email: Mail,
  whatsapp: WhatsAppIcon,
};

const eventTypeColors: Record<string, string> = {
  task: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  call: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
  meeting: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  email: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  whatsapp: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
};

const eventTypeHeaderColors: Record<string, string> = {
  task: 'border-b-blue-500',
  call: 'border-b-cyan-500',
  meeting: 'border-b-purple-500',
  email: 'border-b-orange-500',
  whatsapp: 'border-b-emerald-500',
};

const formatDuration = (minutes: number) => {
  if (minutes >= 60) {
    const hours = minutes / 60;
    return `${hours}h`;
  }
  return `${minutes} min`;
};

export function ActivityViewDialog({
  activity,
  open,
  onOpenChange,
  onComplete,
  onPostpone,
  onEdit,
  onDelete,
}: ActivityViewDialogProps) {
  const [postponeOpen, setPostponeOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);

  if (!activity) return null;

  const Icon = eventTypeIcons[activity.type] || CheckSquare;
  const isPast = activity.date < new Date() && !activity.completed;
  const isTask = ['task', 'call', 'meeting', 'whatsapp'].includes(activity.type);

  const handleComplete = () => {
    if (onComplete) {
      onComplete(activity.id);
      toast.success('Atividade marcada como concluída!');
    }
    onOpenChange(false);
  };

  const handlePostpone = () => {
    if (newDate && onPostpone) {
      onPostpone(activity.id, newDate);
      toast.success(`Atividade adiada para ${format(newDate, "dd/MM/yyyy", { locale: ptBR })}`);
    }
    setPostponeOpen(false);
    setNewDate(undefined);
    onOpenChange(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(activity);
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(activity.id);
      toast.success('Atividade excluída com sucesso!');
    }
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  const openWhatsApp = () => {
    const phone = activity.contactPhone?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn('sm:max-w-[450px] border-b-4', eventTypeHeaderColors[activity.type] || 'border-b-blue-500')}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', eventTypeColors[activity.type] || 'bg-blue-500/20 text-blue-500')}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <DialogTitle className={cn('text-lg', activity.completed && 'line-through opacity-70')}>
                  {activity.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes da atividade
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {activity.completed ? (
                <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluída
                </Badge>
              ) : isPast ? (
                <Badge variant="destructive">
                  <Clock className="h-3 w-3 mr-1" />
                  Atrasada
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pendente
                </Badge>
              )}
              <Badge variant="outline" className={eventTypeColors[activity.type] || ''}>
                {eventTypeLabels[activity.type] || activity.type}
              </Badge>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className={cn(isPast && !activity.completed && 'text-destructive font-medium')}>
                {format(activity.date, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>

            {/* Duration */}
            {activity.durationMinutes && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Duração: {formatDuration(activity.durationMinutes)}</span>
              </div>
            )}

            {/* Deal */}
            {activity.dealName && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Negócio: <span className="text-foreground font-medium">{activity.dealName}</span>
                </span>
              </div>
            )}

            {/* Contact Info */}
            {(activity.contactName || activity.contactEmail || activity.contactPhone) && (
              <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Contato
                </div>
                {activity.contactName && (
                  <span className="text-sm">{activity.contactName}</span>
                )}
                {activity.contactEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {activity.contactEmail}
                  </div>
                )}
                {activity.contactPhone && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-emerald-600 w-fit"
                    onClick={openWhatsApp}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Enviar WhatsApp
                  </Button>
                )}
              </div>
            )}

            {/* Description */}
            {activity.description && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                <p className="text-sm">{activity.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {/* Postpone Button */}
              <Popover open={postponeOpen} onOpenChange={setPostponeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Adiar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                  />
                  <div className="p-3 border-t flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPostponeOpen(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handlePostpone} disabled={!newDate}>
                      Confirmar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Complete Button - Only for tasks that aren't completed */}
              {isTask && !activity.completed && (
                <Button variant="outline" size="sm" className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={handleComplete}>
                  <CheckCircle2 className="h-4 w-4" />
                  Concluir
                </Button>
              )}

              {/* Edit Button */}
              <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>

              {/* Delete Button */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{activity.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}