import { Skeleton } from '@/components/ui/skeleton';
import { useTeamProductivity } from '../hooks/useTeamProductivity';
import { ProductivityKpiCards } from '../components/productivity/ProductivityKpiCards';
import { TasksByTypeChart } from '../components/productivity/TasksByTypeChart';
import { ProductivityRankingTable } from '../components/productivity/ProductivityRankingTable';
import { ProductivityEvolutionChart } from '../components/productivity/ProductivityEvolutionChart';
import { TasksByCompanyTable } from '../components/productivity/TasksByCompanyTable';
import { ProductivityFilters } from '../components/productivity/ProductivityFilters';
import { Users2 } from 'lucide-react';

export function CrmTeamProductivity() {
  const {
    totals,
    tasksByType,
    ranking,
    evolution,
    tasks,
    filters,
    setFilters,
    isLoading,
  } = useTeamProductivity();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Produtividade da Equipe</h1>
        </div>
      </div>

      {/* Filters */}
      <ProductivityFilters filters={filters} setFilters={setFilters} />

      {/* KPI Cards */}
      <ProductivityKpiCards totals={totals} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksByTypeChart tasksByType={tasksByType} />
        <ProductivityRankingTable ranking={ranking} />
      </div>

      {/* Evolution Chart */}
      <ProductivityEvolutionChart evolution={evolution} />

      {/* Tasks Table */}
      <TasksByCompanyTable tasks={tasks} />
    </div>
  );
}
