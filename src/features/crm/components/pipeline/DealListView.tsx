import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePaginatedDeals } from '../../hooks/usePaginatedDeals';
import { useFunnelStages } from '../../hooks/useFunnelStages';
import { useSellers } from '../../hooks/useSellers';
import { useBulkDealActions } from '../../hooks/useBulkDealActions';
import { BulkActionsBar } from './BulkActionsBar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { Deal } from '../../lib/types';

interface DealListViewProps {
  deals?: Deal[]; // Optional - if not provided, uses paginated hook
  funnelId?: string;
}

const sourceLabels: Record<string, string> = {
  meta_ads: 'Meta Ads',
  whatsapp: 'WhatsApp',
  site: 'Site',
  referral: 'Indicação',
  manual: 'Manual',
};

export function DealListView({ deals: propDeals, funnelId }: DealListViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const {
    deals: paginatedDeals,
    totalCount,
    currentPage,
    totalPages,
    isLoading,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    pageSize,
  } = usePaginatedDeals();

  const { stages } = useFunnelStages(funnelId);
  const { data: sellers = [] } = useSellers();
  const { bulkDelete, bulkMoveStage, bulkAssignSeller, isLoading: isBulkLoading } = useBulkDealActions();

  // Filter deals to only show those in the selected funnel's stages
  const stageIds = new Set(stages.map(s => s.id));
  const allDeals = propDeals || paginatedDeals;
  const deals = funnelId && stages.length > 0 
    ? allDeals.filter(d => stageIds.has(d.stage_id)) 
    : allDeals;
  const showPagination = !propDeals && totalPages > 1;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(deals.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (dealId: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(dealId);
    } else {
      newSet.delete(dealId);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
    bulkDelete([...selectedIds]);
    setSelectedIds(new Set());
  };

  const handleBulkMoveStage = (stageId: string) => {
    bulkMoveStage({ dealIds: [...selectedIds], stageId });
    setSelectedIds(new Set());
  };

  const handleBulkAssignSeller = (sellerId: string | null) => {
    bulkAssignSeller({ dealIds: [...selectedIds], sellerId });
    setSelectedIds(new Set());
  };

  const isAllSelected = deals.length > 0 && selectedIds.size === deals.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < deals.length;

  if (isLoading && !propDeals) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      {!propDeals && totalCount > 0 && (
        <div className="text-sm text-muted-foreground">
          Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} de {totalCount} negócios
        </div>
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onMoveToStage={handleBulkMoveStage}
        onAssignSeller={handleBulkAssignSeller}
        onClearSelection={() => setSelectedIds(new Set())}
        stages={stages}
        sellers={sellers}
        isLoading={isBulkLoading}
      />

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) {
                      (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isIndeterminate;
                    }
                  }}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Nome do Deal</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data Criação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow 
                key={deal.id} 
                className={`hover:bg-muted/50 ${selectedIds.has(deal.id) ? 'bg-primary/5' : ''}`}
              >
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedIds.has(deal.id)}
                    onCheckedChange={(checked) => handleSelectOne(deal.id, !!checked)}
                    aria-label={`Selecionar ${deal.name}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    to={`/crm/deals/${deal.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {deal.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {deal.contact ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(deal.contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{deal.contact.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(deal.value)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: deal.funnel_stage?.color,
                      color: deal.funnel_stage?.color,
                    }}
                  >
                    {deal.funnel_stage?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  {deal.assigned_to?.email?.split('@')[0] || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {deal.source ? sourceLabels[deal.source] || deal.source : '-'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(deal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
              </TableRow>
            ))}
            {deals.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum deal encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => hasPreviousPage && goToPage(currentPage - 1)}
                className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => goToPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => hasNextPage && goToPage(currentPage + 1)}
                className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
