import { useParams } from 'react-router-dom';
import { DealHeader } from '../components/deals/DealHeader';
import { DealTasks } from '../components/deals/DealTasks';
import { DealTimeline } from '../components/deals/DealTimeline';
import { useDealByIdSupabase, useTasks, useTimelineEvents } from '@/hooks/useCrmData';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

export function CrmDealDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: deal, isLoading, error } = useDealByIdSupabase(id!);
  const { data: tasks = [] } = useTasks(id);
  const { data: timeline = [] } = useTimelineEvents(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Deal não encontrado</h2>
            <p className="text-muted-foreground text-center">
              O deal solicitado não existe ou você não tem permissão para visualizá-lo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DealHeader deal={deal} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealTasks tasks={tasks} />
        <DealTimeline timeline={timeline} />
      </div>
    </div>
  );
}
