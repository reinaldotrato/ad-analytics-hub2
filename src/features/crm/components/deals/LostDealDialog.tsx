import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThumbsDown, AlertCircle, CalendarIcon } from 'lucide-react';
import { useLossReasons } from '@/hooks/useCrmData';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LostDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealName: string;
  onConfirm: (lossReasonId: string, lossReason: string, closedAt: Date) => void;
}

export function LostDealDialog({
  open,
  onOpenChange,
  dealName,
  onConfirm,
}: LostDealDialogProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');
  const [closedDate, setClosedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: lossReasons = [], isLoading } = useLossReasons();

  // Filter only active reasons
  const activeReasons = lossReasons.filter(r => r.is_active);

  useEffect(() => {
    if (open) {
      setSelectedReasonId('');
      setClosedDate(new Date());
    }
  }, [open]);

  const selectedReason = activeReasons.find(r => r.id === selectedReasonId);
  const isValid = !!selectedReasonId && !!selectedReason;

  const handleConfirm = async () => {
    if (!isValid || !selectedReason) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selectedReason.id, selectedReason.name, closedDate);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <ThumbsDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Marcar Negócio como Perdido</DialogTitle>
              <DialogDescription className="mt-1">
                {dealName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando motivos...</p>
          ) : activeReasons.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Nenhum motivo de perda cadastrado
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Cadastre motivos de perda nas configurações do CRM para poder marcar negócios como perdidos.
                </p>
                <Link to="/crm/settings">
                  <Button variant="outline" size="sm" className="mt-2">
                    Ir para Configurações
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="lossReason" className="text-sm font-medium">
                  Motivo da Perda <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedReasonId} onValueChange={setSelectedReasonId}>
                  <SelectTrigger id="lossReason">
                    <SelectValue placeholder="Selecione o motivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeReasons.map((reason) => (
                      <SelectItem key={reason.id} value={reason.id}>
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedReason?.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedReason.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Data da Perda</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !closedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {closedDate ? format(closedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione uma data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={closedDate}
                      onSelect={(date) => date && setClosedDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Deixe a data atual ou escolha uma data retroativa
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting || activeReasons.length === 0}
            variant="destructive"
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar Perda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}