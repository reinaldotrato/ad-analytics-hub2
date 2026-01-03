import { X, Trash2, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { FunnelStage } from '../../lib/types';
import type { Seller } from '../../hooks/useSellers';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onMoveToStage: (stageId: string) => void;
  onAssignSeller: (sellerId: string | null) => void;
  onClearSelection: () => void;
  stages: FunnelStage[];
  sellers: Seller[];
  isLoading?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onMoveToStage,
  onAssignSeller,
  onClearSelection,
  stages,
  sellers,
  isLoading,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
      <Badge variant="secondary" className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
      </Badge>

      <div className="flex-1" />

      {/* Move to Stage */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Mover para etapa
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {stages.map((stage) => (
            <DropdownMenuItem
              key={stage.id}
              onClick={() => onMoveToStage(stage.id)}
              className="flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              {stage.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Assign Seller */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <UserPlus className="h-4 w-4 mr-2" />
            Atribuir vendedor
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onAssignSeller(null)}>
            <span className="text-muted-foreground">Sem vendedor</span>
          </DropdownMenuItem>
          {sellers.map((seller) => (
            <DropdownMenuItem
              key={seller.id}
              onClick={() => onAssignSeller(seller.id)}
            >
              {seller.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete with confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedCount}{' '}
              {selectedCount === 1 ? 'negócio' : 'negócios'}. Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear selection */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="ml-2"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
