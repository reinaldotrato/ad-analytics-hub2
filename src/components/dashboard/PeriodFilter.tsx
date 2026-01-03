import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface PeriodFilterProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onEndDateChange?: (date: Date | undefined) => void;
}

export function PeriodFilter({
  dateRange,
  onDateRangeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: PeriodFilterProps) {
  // Support both range mode and individual date mode
  const effectiveFrom = dateRange?.from || startDate;
  const effectiveTo = dateRange?.to || endDate;

  const handleSelect = (range: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
    if (onStartDateChange && range?.from !== effectiveFrom) {
      onStartDateChange(range?.from);
    }
    if (onEndDateChange && range?.to !== effectiveTo) {
      onEndDateChange(range?.to);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !effectiveFrom && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {effectiveFrom ? (
              effectiveTo ? (
                <>
                  {format(effectiveFrom, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(effectiveTo, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(effectiveFrom, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={effectiveFrom}
            selected={{ from: effectiveFrom, to: effectiveTo }}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
