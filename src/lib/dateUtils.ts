import { format, subDays, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDateDisplay(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDateForQuery(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = startOfMonth(endDate);
  return { startDate, endDate };
}

export function getPreviousPeriodDates(startDate: Date, endDate: Date): { prevStartDate: Date; prevEndDate: Date } {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  const prevEndDate = subDays(startDate, 1);
  const prevStartDate = subDays(prevEndDate, diffDays);
  
  return { prevStartDate, prevEndDate };
}
