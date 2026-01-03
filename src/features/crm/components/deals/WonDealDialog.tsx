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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Trophy, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WonDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealName: string;
  currentValue?: number;
  onConfirm: (value: number, closedAt: Date) => void;
}

export function WonDealDialog({
  open,
  onOpenChange,
  dealName,
  currentValue = 0,
  onConfirm,
}: WonDealDialogProps) {
  const [value, setValue] = useState<string>(currentValue.toString());
  const [closedDate, setClosedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(currentValue > 0 ? currentValue.toString() : '');
      setClosedDate(new Date());
    }
  }, [open, currentValue]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const rawValue = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    setValue(rawValue);
  };

  const parsedValue = parseFloat(value) || 0;
  const isValid = parsedValue > 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleConfirm = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onConfirm(parsedValue, closedDate);
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <Trophy className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <DialogTitle>Marcar Negócio como Ganho</DialogTitle>
              <DialogDescription className="mt-1">
                {dealName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="saleValue" className="text-sm font-medium">
              Valor da Venda <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="saleValue"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={value}
                onChange={handleValueChange}
                className="pl-10 text-lg font-medium"
                autoFocus
              />
            </div>
            {parsedValue > 0 && (
              <p className="text-sm text-muted-foreground">
                Valor: {formatCurrency(parsedValue)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Data da Venda</Label>
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

          {!isValid && value !== '' && (
            <p className="text-sm text-destructive">
              O valor da venda é obrigatório e deve ser maior que zero.
            </p>
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
            disabled={!isValid || isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? 'Salvando...' : 'Confirmar Venda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}