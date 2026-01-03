import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CalendarDays, List, Plus } from 'lucide-react';
import { CalendarView } from '../components/calendar/CalendarView';
import { DailyCalendarView } from '../components/calendar/DailyCalendarView';
import { WeeklyCalendarView } from '../components/calendar/WeeklyCalendarView';
import { ActivityListView } from '../components/calendar/ActivityListView';

type CalendarMode = 'day' | 'week' | 'month';
type ViewType = 'calendar' | 'list';

export function CrmCalendar() {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [viewType, setViewType] = useState<ViewType>('calendar');

  const renderCalendarView = () => {
    switch (calendarMode) {
      case 'day':
        return <DailyCalendarView />;
      case 'week':
        return <WeeklyCalendarView />;
      case 'month':
      default:
        return <CalendarView />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendário de Atividades</h1>
          <p className="text-muted-foreground">
            Acompanhe suas tarefas e eventos do CRM
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Calendar mode toggle (day/week/month) */}
          {viewType === 'calendar' && (
            <ToggleGroup
              type="single"
              value={calendarMode}
              onValueChange={(v) => v && setCalendarMode(v as CalendarMode)}
              className="bg-muted p-1 rounded-lg"
            >
              <ToggleGroupItem value="day" aria-label="Visualização diária" className="text-xs px-3">
                Dia
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Visualização semanal" className="text-xs px-3">
                Semana
              </ToggleGroupItem>
              <ToggleGroupItem value="month" aria-label="Visualização mensal" className="text-xs px-3">
                Mês
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* View type toggle (calendar/list) */}
          <ToggleGroup
            type="single"
            value={viewType}
            onValueChange={(v) => v && setViewType(v as ViewType)}
          >
            <ToggleGroupItem value="calendar" aria-label="Visualização calendário">
              <CalendarDays className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Visualização lista">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      </div>

      {viewType === 'calendar' ? renderCalendarView() : <ActivityListView />}
    </div>
  );
}
