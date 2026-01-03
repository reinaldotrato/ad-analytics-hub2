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
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, XCircle } from 'lucide-react';

interface ReopenDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealName: string;
  currentStatus: 'won' | 'lost';
  onConfirm: () => void;
}

export function ReopenDealDialog({
  open,
  onOpenChange,
  dealName,
  currentStatus,
  onConfirm,
}: ReopenDealDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-500" />
            Reabrir Negócio
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>Você está prestes a reabrir o negócio:</p>
              
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{dealName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Status atual:</span>
                  {currentStatus === 'won' ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <Trophy className="h-3 w-3 mr-1" />
                      Ganho
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                      <XCircle className="h-3 w-3 mr-1" />
                      Perdido
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm">
                Ao reabrir, o negócio voltará a aparecer como ativo no funil de vendas.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Confirmar Reabertura
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
