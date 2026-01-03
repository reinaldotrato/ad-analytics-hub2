import { useState } from 'react';
import { Globe } from 'lucide-react';
import { startOfMonth } from 'date-fns';
import { useAdminGlobalData } from '@/hooks/useAdminGlobalData';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import { GlobalKpiCards } from '@/components/admin-dashboard/GlobalKpiCards';
import { SpendByChannelChart } from '@/components/admin-dashboard/SpendByChannelChart';
import { DerivedMetricsCard } from '@/components/admin-dashboard/DerivedMetricsCard';
import { ClientSummaryCards } from '@/components/admin-dashboard/ClientSummaryCards';
import { ClientPerformanceTable } from '@/components/admin-dashboard/ClientPerformanceTable';
import { ActiveCampaignsTable } from '@/components/admin-dashboard/ActiveCampaignsTable';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminGlobalDashboard() {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data, isLoading, error } = useAdminGlobalData(startDate, endDate);

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Dashboard Global</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard Global</h1>
            <p className="text-sm text-muted-foreground">Visão consolidada de todos os clientes</p>
          </div>
        </div>
        <PeriodFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : data ? (
        <>
          {/* KPI Cards */}
          <GlobalKpiCards totals={data.totals} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendByChannelChart
              googleSpend={data.totals.googleSpend}
              metaSpend={data.totals.metaSpend}
            />
            <DerivedMetricsCard
              cal={data.totals.cal}
              cav={data.totals.cav}
              roas={data.totals.roas}
              conversionRate={data.totals.conversionRate}
            />
          </div>

          {/* Client Summary Cards */}
          <ClientSummaryCards clients={data.byClient} />

          {/* Client Performance Table */}
          <ClientPerformanceTable clients={data.byClient} />

          {/* Active Campaigns Table */}
          <ActiveCampaignsTable campaigns={data.activeCampaigns} />
        </>
      ) : null}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
