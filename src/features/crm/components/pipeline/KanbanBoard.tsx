import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { DealCard, type QuickActionType } from './DealCard';
import { useDeals } from '../../hooks/useDeals';
import { useFunnelStages } from '../../hooks/useFunnelStages';
import { useSeedDefaultStages } from '../../hooks/useSeedDefaultStages';
import { WonDealDialog } from '../deals/WonDealDialog';
import { LostDealDialog } from '../deals/LostDealDialog';
import { ReopenDealDialog } from '../deals/ReopenDealDialog';
import { TaskFormDialog } from '../deals/TaskFormDialog';
import type { Deal, Task } from '../../lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useCreateTask } from '@/hooks/useCrmData';

interface KanbanBoardProps {
  filteredDeals?: Deal[];
  funnelId?: string;
}

export function KanbanBoard({ filteredDeals, funnelId }: KanbanBoardProps) {
  const { deals: allDeals, moveDeal, updateDeal } = useDeals();
  const { stages, isLoading: stagesLoading } = useFunnelStages(funnelId);
  const { seedStages, isSeeding } = useSeedDefaultStages();
  const { mutate: createTask } = useCreateTask();
  const [activeId, setActiveId] = useState<string | null>(null);

  // State for won/lost/reopen dialogs
  const [wonDialogOpen, setWonDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [pendingMoveData, setPendingMoveData] = useState<{
    dealId: string;
    stageId: string;
    deal: Deal;
  } | null>(null);
  
  // Track recently reopened deal for animation
  const [recentlyReopenedDealId, setRecentlyReopenedDealId] = useState<string | null>(null);
  
  // State for task dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedDealForTask, setSelectedDealForTask] = useState<Deal | null>(null);

  // Filter deals to only show those belonging to stages in the selected funnel
  const stageIds = new Set(stages.map(s => s.id));
  const funnelDeals = (filteredDeals ?? allDeals).filter(d => stageIds.has(d.stage_id));
  const deals = funnelDeals;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;
    const deal = allDeals.find(d => d.id === dealId);

    if (!deal) return;

    // Determine target stage ID
    let targetStageId: string | null = null;

    // Check if dropped over a column (stage)
    const isOverColumn = stages.some(s => s.id === overId);
    
    if (isOverColumn) {
      targetStageId = overId;
    } else {
      // Dropped over another deal - find which column it's in
      const targetDeal = allDeals.find(d => d.id === overId);
      if (targetDeal && targetDeal.stage_id) {
        targetStageId = targetDeal.stage_id;
      }
    }

    if (!targetStageId || targetStageId === deal.stage_id) return;

    // Find target stage
    const targetStage = stages.find(s => s.id === targetStageId);
    if (!targetStage) return;

    // Check if deal is finished (won or lost) and target is an open stage
    const isFinishedDeal = deal.status === 'won' || deal.status === 'lost';
    const isTargetOpenStage = !targetStage.is_won && !targetStage.is_lost;

    if (isFinishedDeal && isTargetOpenStage) {
      setPendingMoveData({ dealId, stageId: targetStageId, deal });
      setReopenDialogOpen(true);
      return;
    }

    // Check if target stage is won or lost
    if (targetStage.is_won) {
      setPendingMoveData({ dealId, stageId: targetStageId, deal });
      setWonDialogOpen(true);
      return;
    }

    if (targetStage.is_lost) {
      setPendingMoveData({ dealId, stageId: targetStageId, deal });
      setLostDialogOpen(true);
      return;
    }

    // Normal move
    moveDeal(dealId, targetStageId);
  };

  const handleWonConfirm = (value: number, closedAt: Date) => {
    if (!pendingMoveData) return;
    
    updateDeal(pendingMoveData.dealId, {
      stage_id: pendingMoveData.stageId,
      value: value,
      status: 'won',
      closed_at: closedAt.toISOString(),
    });
    
    setPendingMoveData(null);
    toast.success('Negócio marcado como ganho!');
  };

  const handleLostConfirm = (lossReasonId: string, lossReason: string, closedAt: Date) => {
    if (!pendingMoveData) return;
    
    updateDeal(pendingMoveData.dealId, {
      stage_id: pendingMoveData.stageId,
      status: 'lost',
      lost_reason: lossReason,
      closed_at: closedAt.toISOString(),
    });
    
    setPendingMoveData(null);
    toast.success('Negócio marcado como perdido');
  };

  const handleReopenConfirm = () => {
    if (!pendingMoveData) return;
    
    const dealId = pendingMoveData.dealId;
    
    updateDeal(dealId, {
      stage_id: pendingMoveData.stageId,
      status: 'open',
      closed_at: null,
      lost_reason: null,
    });
    
    // Trigger animation
    setRecentlyReopenedDealId(dealId);
    setTimeout(() => {
      setRecentlyReopenedDealId(null);
    }, 2000);
    
    setPendingMoveData(null);
    setReopenDialogOpen(false);
    toast.success('Negócio reaberto com sucesso!');
  };

  const activeDeal = activeId ? allDeals.find(d => d.id === activeId) : null;

  const handleQuickAction = (dealId: string, action: QuickActionType) => {
    const deal = allDeals.find(d => d.id === dealId);
    if (!deal) return;

    switch (action) {
      case 'whatsapp':
        if (deal.contact?.phone) {
          // Format phone number for WhatsApp (remove special characters)
          const phone = deal.contact.phone.replace(/\D/g, '');
          const message = encodeURIComponent(`Olá ${deal.contact.name || ''}!`);
          window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
        } else {
          toast.warning('Este contato não possui telefone cadastrado');
        }
        break;
        
      case 'email':
        if (deal.contact?.email) {
          const subject = encodeURIComponent(`Sobre: ${deal.name}`);
          window.open(`mailto:${deal.contact.email}?subject=${subject}`, '_blank');
          toast.success(`Abrindo e-mail para ${deal.contact.email}`);
        } else {
          toast.warning('Este contato não possui e-mail cadastrado');
        }
        break;
        
      case 'task':
        setSelectedDealForTask(deal);
        setTaskDialogOpen(true);
        break;
    }
  };

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (!selectedDealForTask) return;
    
    createTask({
      ...taskData,
      deal_id: selectedDealForTask.id,
    } as any, {
      onSuccess: () => {
        toast.success('Tarefa criada com sucesso!');
        setTaskDialogOpen(false);
        setSelectedDealForTask(null);
      },
      onError: () => {
        toast.error('Erro ao criar tarefa');
      }
    });
  };

  // Loading state
  if (stagesLoading) {
    return (
      <div className="h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 pb-4 min-w-max h-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-72 flex-shrink-0">
              <Skeleton className="h-10 w-full mb-3 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no stages configured
  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-muted/50 rounded-full p-6 mb-6">
          <LayoutGrid className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum funil configurado</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Configure as etapas do funil de vendas para começar a gerenciar seus negócios no Kanban.
        </p>
        <Button onClick={() => seedStages()} disabled={isSeeding} size="lg">
          {isSeeding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Funil Padrão'
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full overflow-x-auto overflow-y-hidden scrollbar-thin">
          <div className="flex gap-4 pb-4 pr-4 min-w-max h-full">
            {stages.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={deals.filter(d => d.stage_id === stage.id)}
                onQuickAction={handleQuickAction}
                recentlyReopenedDealId={recentlyReopenedDealId}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDeal ? (
            <div className="w-72 max-w-72">
              <DealCard deal={activeDeal} overlay maxWidth={260} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Won Deal Dialog */}
      <WonDealDialog
        open={wonDialogOpen}
        onOpenChange={(open) => {
          setWonDialogOpen(open);
          if (!open) setPendingMoveData(null);
        }}
        dealName={pendingMoveData?.deal.name || ''}
        currentValue={pendingMoveData?.deal.value}
        onConfirm={handleWonConfirm}
      />

      {/* Lost Deal Dialog */}
      <LostDealDialog
        open={lostDialogOpen}
        onOpenChange={(open) => {
          setLostDialogOpen(open);
          if (!open) setPendingMoveData(null);
        }}
        dealName={pendingMoveData?.deal.name || ''}
        onConfirm={handleLostConfirm}
      />

      {/* Reopen Deal Dialog */}
      <ReopenDealDialog
        open={reopenDialogOpen}
        onOpenChange={(open) => {
          setReopenDialogOpen(open);
          if (!open) setPendingMoveData(null);
        }}
        dealName={pendingMoveData?.deal.name || ''}
        currentStatus={(pendingMoveData?.deal.status as 'won' | 'lost') || 'won'}
        onConfirm={handleReopenConfirm}
      />

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setSelectedDealForTask(null);
        }}
        dealId={selectedDealForTask?.id}
        onSave={handleSaveTask}
      />
    </>
  );
}
