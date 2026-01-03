import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DealCard, type QuickActionType } from './DealCard';
import type { Deal, FunnelStage } from '../../lib/types';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  stage: FunnelStage;
  deals: Deal[];
  onQuickAction?: (dealId: string, action: QuickActionType) => void;
  recentlyReopenedDealId?: string | null;
}

export function KanbanColumn({ stage, deals, onQuickAction, recentlyReopenedDealId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const CARD_WIDTH = 260;

  return (
    <Card
      className={cn(
        'w-72 max-w-72 flex-shrink-0 flex flex-col h-full liquid-glass overflow-clip',
        isOver && 'ring-2 ring-primary/50'
      )}
    >
      <CardHeader 
        className="p-3 pb-2 flex-shrink-0 rounded-t-xl stage-header-elevated"
        style={{
          '--stage-color': stage.color,
        } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ 
                backgroundColor: stage.color,
                boxShadow: `0 0 8px ${stage.color}60`
              }}
            />
            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-semibold">
            {deals.length}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(totalValue)}
        </p>
        {/* Gradient border bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b"
          style={{ 
            background: `linear-gradient(90deg, ${stage.color}, ${stage.color}40)`
          }}
        />
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className="p-2 pt-0 flex-1 overflow-hidden"
        style={{ overflow: 'hidden' }}
      >
        <ScrollArea className="h-full [&>[data-radix-scroll-area-viewport]]:overflow-x-hidden">
          <SortableContext
            items={deals.map(d => d.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 pt-3 pr-2 w-full max-w-full overflow-hidden box-border">
              {deals.map(deal => (
                <DealCard 
                  key={deal.id} 
                  deal={deal} 
                  onQuickAction={onQuickAction} 
                  maxWidth={CARD_WIDTH}
                  isRecentlyReopened={deal.id === recentlyReopenedDealId}
                />
              ))}
            </div>
          </SortableContext>

          {deals.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum deal nesta etapa
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
