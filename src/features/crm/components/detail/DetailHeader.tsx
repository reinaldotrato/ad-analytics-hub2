import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, RotateCcw, ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DetailData, DetailEntityType } from '../../hooks/useDetailData';
import { DealFormDialog } from '../deals/DealFormDialog';
import { WonDealDialog } from '../deals/WonDealDialog';
import { LostDealDialog } from '../deals/LostDealDialog';
import { useUpdateDeal, useFunnelStagesSupabase, type CrmDeal } from '@/hooks/useCrmData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fixEncoding } from '@/lib/fixEncoding';

interface DetailHeaderProps {
  type: DetailEntityType;
  data: DetailData;
}

export function DetailHeader({ type, data }: DetailHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateDeal = useUpdateDeal();
  const { data: allStages = [] } = useFunnelStagesSupabase();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [wonDialogOpen, setWonDialogOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [pendingStageId, setPendingStageId] = useState<string | null>(null);

  const getTitle = () => {
    if (type === 'deal') return 'Negócio';
    if (type === 'contact') return 'Contato';
    if (type === 'company') return 'Empresa';
    return '';
  };

  const getCurrentStageIndex = () => {
    if (type !== 'deal' || !data.stages || !data.funnel_stage) return -1;
    return data.stages.findIndex(s => s.id === data.funnel_stage?.id);
  };

  const currentStageIndex = getCurrentStageIndex();

  const handleSaveDeal = (updates: Partial<CrmDeal>) => {
    updateDeal.mutate(
      { id: data.id, updates },
      {
        onSuccess: () => {
          toast.success('Negócio atualizado com sucesso');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
        onError: () => {
          toast.error('Erro ao atualizar negócio');
        },
      }
    );
  };

  const handleWonClick = () => {
    // Find the won stage
    const wonStage = allStages.find(s => s.is_won);
    if (wonStage) {
      setPendingStageId(wonStage.id);
    }
    setWonDialogOpen(true);
  };

  const handleLostClick = () => {
    // Find the lost stage
    const lostStage = allStages.find(s => s.is_lost);
    if (lostStage) {
      setPendingStageId(lostStage.id);
    }
    setLostDialogOpen(true);
  };

  const handleWonConfirm = (value: number, closedAt: Date) => {
    const wonStage = allStages.find(s => s.is_won);
    const updates: Partial<CrmDeal> = {
      value: value,
      status: 'won',
      closed_at: closedAt.toISOString(),
    };
    
    if (wonStage) {
      updates.stage_id = wonStage.id;
    }

    updateDeal.mutate(
      { id: data.id, updates },
      {
        onSuccess: () => {
          toast.success('Negócio marcado como ganho!');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
          queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
        },
      }
    );
    setPendingStageId(null);
  };

  const handleLostConfirm = (lossReasonId: string, lossReason: string, closedAt: Date) => {
    const lostStage = allStages.find(s => s.is_lost);
    const updates: Partial<CrmDeal> = {
      status: 'lost',
      lost_reason: lossReason,
      closed_at: closedAt.toISOString(),
    };
    
    if (lostStage) {
      updates.stage_id = lostStage.id;
    }

    updateDeal.mutate(
      { id: data.id, updates },
      {
        onSuccess: () => {
          toast.success('Negócio marcado como perdido');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
          queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
        },
      }
    );
    setPendingStageId(null);
  };

  const handleReopen = () => {
    updateDeal.mutate(
      { id: data.id, updates: { status: 'open', closed_at: null } },
      {
        onSuccess: () => {
          toast.success('Negócio reaberto');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
      }
    );
  };

  const handleStageChange = (stageId: string) => {
    // Find the target stage
    const targetStage = allStages.find(s => s.id === stageId);
    
    if (!targetStage) {
      return;
    }

    // Check if target stage is won
    if (targetStage.is_won) {
      setPendingStageId(stageId);
      setWonDialogOpen(true);
      return;
    }

    // Check if target stage is lost
    if (targetStage.is_lost) {
      setPendingStageId(stageId);
      setLostDialogOpen(true);
      return;
    }

    // Normal stage change
    updateDeal.mutate(
      { id: data.id, updates: { stage_id: stageId } },
      {
        onSuccess: () => {
          toast.success('Etapa atualizada');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
      }
    );
  };

  return (
    <>
      <div className="bg-muted/80 border-b border-border">
        {/* Top bar with back button and title */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} className="mr-2" />
              Voltar
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="min-w-0 flex-1 max-w-md">
              <span className="text-sm text-muted-foreground">{getTitle()}</span>
              <h1 className="text-lg font-bold text-foreground break-words line-clamp-2">
                {fixEncoding(data.name)}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {type === 'deal' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit size={16} className="mr-2" />
                Editar
              </Button>
            )}
            
            {type === 'deal' && data.status !== 'won' && data.status !== 'lost' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWonClick}
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  <ThumbsUp size={16} className="mr-2" />
                  Ganhou
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLostClick}
                  className="bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
                >
                  <ThumbsDown size={16} className="mr-2" />
                  Perdeu
                </Button>
              </>
            )}
            {type === 'deal' && (data.status === 'won' || data.status === 'lost') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReopen}
              >
                <RotateCcw size={16} className="mr-2" />
                Reabrir
              </Button>
            )}
          </div>
        </div>

        {/* Stage tabs (only for deals) */}
        {type === 'deal' && data.stages && data.stages.length > 0 && (
          <div className="px-6 py-2 flex gap-1 overflow-x-auto">
            {data.stages.map((stage, index) => {
              const isActive = index === currentStageIndex;
              const isPassed = index < currentStageIndex;
              
              return (
                <button
                  key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : isPassed
                        ? 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-background/50 text-muted-foreground hover:bg-background'
                    }
                  `}
                  style={isActive ? { backgroundColor: stage.color } : undefined}
                >
                  {stage.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {type === 'deal' && (
        <DealFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          deal={{
            id: data.id,
            name: data.name,
            value: data.value,
            stage_id: data.funnel_stage?.id,
            contact_id: data.contact?.id,
            assigned_to_id: data.assigned_to?.id,
            source: data.source,
            probability: data.probability,
            expected_close_date: data.expected_close_date,
          }}
          onSave={handleSaveDeal}
        />
      )}

      {/* Won Dialog */}
      <WonDealDialog
        open={wonDialogOpen}
        onOpenChange={(open) => {
          setWonDialogOpen(open);
          if (!open) setPendingStageId(null);
        }}
        dealName={data.name}
        currentValue={data.value}
        onConfirm={handleWonConfirm}
      />

      {/* Lost Dialog */}
      <LostDealDialog
        open={lostDialogOpen}
        onOpenChange={(open) => {
          setLostDialogOpen(open);
          if (!open) setPendingStageId(null);
        }}
        dealName={data.name}
        onConfirm={handleLostConfirm}
      />
    </>
  );
}

export default DetailHeader;
