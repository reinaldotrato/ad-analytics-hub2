import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Phone, Users } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { format, setHours, setMinutes, getHours, getMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CrmTask } from '@/hooks/useCrmData';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Partial<CrmTask & { task_type?: string; duration_minutes?: number }> | null;
  dealId?: string;
  onSave: (task: Partial<CrmTask & { task_type?: string; duration_minutes?: number }>) => void;
}

const taskTypes = [
  { value: 'call', label: 'Ligação', icon: Phone },
  { value: 'meeting', label: 'Reunião', icon: Users },
  { value: 'whatsapp', label: 'WhatsApp', icon: WhatsAppIcon },
];

const durationOptions = [
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
];

// Generate time options every 30 minutes from 06:00 to 22:00
const timeOptions = Array.from({ length: 33 }, (_, i) => {
  const hours = Math.floor(i / 2) + 6;
  const minutes = (i % 2) * 30;
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { value, label: value };
});

export function TaskFormDialog({ open, onOpenChange, task, dealId, onSave }: TaskFormDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: undefined as Date | undefined,
    start_time: '09:00',
    completed: false,
    task_type: 'call',
    duration_minutes: 30,
  });

  useEffect(() => {
    if (task) {
      // Validate that due_date is a valid date string before parsing
      let taskDate: Date | undefined;
      if (task.due_date) {
        const parsedDate = new Date(task.due_date);
        if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
          taskDate = parsedDate;
        }
      }
      
      // Extract time from existing task, default to 09:00 if not set or invalid
      let taskTime = '09:00';
      if (taskDate) {
        const hours = getHours(taskDate);
        const minutes = getMinutes(taskDate);
        // Only use existing time if it's not midnight (which indicates no time was set)
        if (hours !== 0 || minutes !== 0) {
          taskTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        }
      }
      
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: taskDate,
        start_time: taskTime,
        completed: task.completed || false,
        task_type: task.task_type || 'call',
        duration_minutes: task.duration_minutes || 30,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: undefined,
        start_time: '09:00',
        completed: false,
        task_type: 'call',
        duration_minutes: 30,
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time into a full ISO string with robust validation
    let dueDateTime: string | undefined;
    
    if (formData.due_date && formData.due_date instanceof Date && !isNaN(formData.due_date.getTime())) {
      // Validate and parse time string
      const timeParts = formData.start_time?.split(':');
      const hours = timeParts?.[0] ? parseInt(timeParts[0], 10) : 9;
      const minutes = timeParts?.[1] ? parseInt(timeParts[1], 10) : 0;
      
      // Ensure hours and minutes are valid numbers
      const validHours = !isNaN(hours) && hours >= 0 && hours <= 23 ? hours : 9;
      const validMinutes = !isNaN(minutes) && minutes >= 0 && minutes <= 59 ? minutes : 0;
      
      const dateWithTime = setMinutes(setHours(formData.due_date, validHours), validMinutes);
      
      // Final validation before converting to ISO
      if (dateWithTime instanceof Date && !isNaN(dateWithTime.getTime())) {
        dueDateTime = dateWithTime.toISOString();
      }
    }
    
    onSave({
      title: formData.title,
      description: formData.description || undefined,
      due_date: dueDateTime,
      deal_id: dealId,
      completed: formData.completed,
      task_type: formData.task_type,
      duration_minutes: formData.duration_minutes,
    });
    onOpenChange(false);
  };

  const isEditing = !!task?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Task Type */}
          <div className="space-y-2">
            <Label>Tipo de Tarefa</Label>
            <div className="flex gap-2">
              {taskTypes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={formData.task_type === value ? 'default' : 'outline'}
                  className="flex-1 gap-2"
                  onClick={() => setFormData({ ...formData, task_type: value })}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Ligar para o cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes da tarefa..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.due_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date
                      ? format(formData.due_date, "dd/MM", { locale: ptBR })
                      : 'Data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData({ ...formData, due_date: date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Hora</Label>
              <Select
                value={formData.start_time}
                onValueChange={(v) => setFormData({ ...formData, start_time: v })}
              >
                <SelectTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duração</Label>
              <Select
                value={String(formData.duration_minutes)}
                onValueChange={(v) => setFormData({ ...formData, duration_minutes: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}