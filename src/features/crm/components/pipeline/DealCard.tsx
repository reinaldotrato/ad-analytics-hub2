import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  Building2, 
  CheckSquare, 
  Plus,
  Mail,
  ListTodo
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import { Link } from 'react-router-dom';
import type { Deal, FunnelStage } from '../../lib/types';
import { cn } from '@/lib/utils';
import { fixEncoding } from '@/lib/fixEncoding';

export type QuickActionType = 'whatsapp' | 'email' | 'task';

interface DealCardProps {
  deal: Deal;
  overlay?: boolean;
  onQuickAction?: (dealId: string, action: QuickActionType) => void;
  /**
   * Força a largura máxima do card (em px). Útil no Kanban dentro do ScrollArea.
   */
  maxWidth?: number;
  /**
   * Indica se o deal foi recentemente reaberto (para animação)
   */
  isRecentlyReopened?: boolean;
}

// Calculate days remaining with color based on urgency
function getDaysRemaining(expectedCloseDate?: string): { days: number; color: string; label: string; passed: boolean } {
  if (!expectedCloseDate) return { days: 0, color: 'muted', label: 'Sem data', passed: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closeDate = new Date(expectedCloseDate);
  closeDate.setHours(0, 0, 0, 0);
  const diffTime = closeDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let color = 'green';
  if (diffDays <= 7 && diffDays > 3) color = 'yellow';
  if (diffDays <= 3) color = 'red';
  
  return { 
    days: Math.abs(diffDays), 
    color, 
    label: diffDays >= 0 ? `${diffDays} dias` : `${Math.abs(diffDays)} dias atrás`,
    passed: diffDays < 0
  };
}

// Get status icon config based on funnel stage
function getStatusConfig(stage?: FunnelStage) {
  if (stage?.is_won) return { Icon: ThumbsUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10' };
  if (stage?.is_lost) return { Icon: ThumbsDown, color: 'text-destructive', bg: 'bg-destructive/10' };
  return { Icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
}

// Get tasks badge color based on count
function getTasksBadgeClasses(count: number) {
  if (count === 0) return 'text-muted-foreground bg-muted';
  if (count <= 2) return 'text-orange-600 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400';
  return 'text-destructive bg-destructive/10';
}

// Get days without interaction badge classes
function getDaysWithoutInteractionClasses(days: number) {
  if (days <= 3) return 'text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400';
  if (days <= 7) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400';
  return 'text-destructive bg-destructive/10';
}

// Get days badge classes based on urgency
function getDaysBadgeClasses(color: string, passed: boolean) {
  if (passed) return 'text-destructive bg-destructive/10';
  switch (color) {
    case 'green': return 'text-green-600 bg-green-100 dark:bg-green-500/20 dark:text-green-400';
    case 'yellow': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400';
    case 'red': return 'text-destructive bg-destructive/10';
    default: return 'text-muted-foreground bg-muted';
  }
}

function DealCardComponent({ deal, overlay, onQuickAction, maxWidth, isRecentlyReopened }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDescription = (deal: Deal) => {
    if (deal.funnel_stage?.is_won && deal.closed_at) {
      return `Ganho em ${new Date(deal.closed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    if (deal.funnel_stage?.is_lost && deal.closed_at) {
      return `Perdido em ${new Date(deal.closed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    if (deal.contact?.name) {
      return deal.contact.name;
    }
    return `Criado em ${new Date(deal.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
  };

  const statusConfig = getStatusConfig(deal.funnel_stage);
  const StatusIcon = statusConfig.Icon;
  const daysInfo = getDaysRemaining(deal.expected_close_date);
  const pendingTasks = deal.pending_tasks_count ?? 0;
  const daysWithoutInteraction = deal.days_without_interaction ?? 0;

  return (
    <Card
      ref={setNodeRef}
      style={{
        ...style,
        boxSizing: 'border-box',
        width: maxWidth ? `${maxWidth}px` : undefined,
        maxWidth: maxWidth ? `${maxWidth}px` : '100%',
      }}
      className={cn(
        'p-4 cursor-grab active:cursor-grabbing transition-all duration-200 w-full max-w-full min-w-0 overflow-hidden',
        'liquid-glass',
        isDragging && 'opacity-80 shadow-lg liquid-glass-dragging',
        overlay && 'shadow-xl liquid-glass-dragging',
        isRecentlyReopened && 'animate-reopen-pulse border-2 border-green-500'
      )}
      {...attributes}
      {...listeners}
    >
      {/* HEADER */}
      <div className="flex items-start gap-2 mb-3 overflow-hidden">
        {/* Status Icon */}
        <div className={cn("flex-shrink-0 p-2 rounded-lg", statusConfig.bg)} aria-label={`Status: ${deal.funnel_stage?.name || 'Em progresso'}`}>
          <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
        </div>
        
        {/* Name and Value */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <Link
            to={`/crm/details/deal/${deal.id}`}
            className="font-bold text-sm text-foreground line-clamp-2 hover:text-primary transition-colors block break-words"
            onClick={(e) => e.stopPropagation()}
          >
            {fixEncoding(deal.name)}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-primary text-sm">
              {formatCurrency(deal.value)}
            </span>
          </div>
        </div>
        
        {/* Days Remaining Badge */}
        {deal.expected_close_date && (
          <Badge 
            variant="secondary" 
            className={cn("text-xs shrink-0 font-medium max-w-[90px] truncate", getDaysBadgeClasses(daysInfo.color, daysInfo.passed))}
          >
            ≈ {daysInfo.label}
          </Badge>
        )}
      </div>
      
      {/* DIVIDER */}
      <Separator className="my-3" />
      
      {/* FOOTER */}
      <div className="flex items-center gap-2 justify-between overflow-hidden">
        {/* Avatar/Company */}
        {deal.contact ? (
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(deal.contact.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        
        {/* Tasks Badge */}
        <Badge 
          variant="secondary" 
          className={cn("text-xs flex-shrink-0", getTasksBadgeClasses(pendingTasks))}
        >
          <CheckSquare className="h-3 w-3 mr-1" />
          {pendingTasks}
        </Badge>

        {/* Days Without Interaction Badge */}
        {daysWithoutInteraction > 0 && (
          <Badge 
            variant="secondary" 
            className={cn("text-xs flex-shrink-0", getDaysWithoutInteractionClasses(daysWithoutInteraction))}
            title="Dias sem interação"
          >
            {daysWithoutInteraction}d
          </Badge>
        )}
        
        {/* Description */}
        <span className="flex-1 text-xs text-muted-foreground truncate">
          {getDescription(deal)}
        </span>
        
        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              className="h-7 w-7 rounded-full flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              aria-label="Ações rápidas"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction?.(deal.id, 'whatsapp');
              }}
              disabled={!deal.contact?.phone}
              className="cursor-pointer"
            >
              <WhatsAppIcon className="mr-2 h-4 w-4 text-[#25D366]" size={16} />
              Enviar WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction?.(deal.id, 'email');
              }}
              disabled={!deal.contact?.email}
              className="cursor-pointer"
            >
              <Mail className="mr-2 h-4 w-4 text-blue-500" />
              Enviar E-mail
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction?.(deal.id, 'task');
              }}
              className="cursor-pointer"
            >
              <ListTodo className="mr-2 h-4 w-4 text-primary" />
              Nova Tarefa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export const DealCard = memo(DealCardComponent);
