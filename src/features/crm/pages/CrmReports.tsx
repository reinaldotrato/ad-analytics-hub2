import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCrmReports } from '../hooks/useCrmReports';
import {
  ReportsFunnelTab,
  ReportsSalesPeriodTab,
  ReportsSellerMetricsTab,
  ReportsLostOpportunitiesTab,
} from '../components/reports';
import { Target, TrendingUp, Users, XCircle, Loader2 } from 'lucide-react';
import { PeriodFilter } from '@/components/dashboard/PeriodFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CrmReports() {
  const [activeTab, setActiveTab] = useState('funnel');
  
  const {
    overviewMetrics,
    funnelMetrics,
    sellerMetrics,
    lostOpportunities,
    getSalesByPeriodData,
    isLoading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    funnels,
    selectedFunnelId,
    setSelectedFunnelId,
  } = useCrmReports();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Relatórios CRM</h1>
          <p className="text-muted-foreground">
            Análise detalhada do seu pipeline de vendas
          </p>
        </header>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Relatórios CRM</h1>
        <p className="text-muted-foreground">
          Análise detalhada do seu pipeline de vendas
        </p>
      </header>

      {/* Global Period Filter */}
      <PeriodFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Funil</span>
          </TabsTrigger>
          <TabsTrigger value="sales-period" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Vendedores</span>
          </TabsTrigger>
          <TabsTrigger value="lost" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Perdidas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          {/* Funnel Selector */}
          {funnels.length > 1 && (
            <div className="mb-4">
              <Select
                value={selectedFunnelId || 'all'}
                onValueChange={(value) => setSelectedFunnelId(value === 'all' ? null : value)}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Selecione um funil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Funis</SelectItem>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <ReportsFunnelTab metrics={funnelMetrics} />
        </TabsContent>

        <TabsContent value="sales-period">
          <ReportsSalesPeriodTab getSalesByPeriod={getSalesByPeriodData} />
        </TabsContent>

        <TabsContent value="sellers">
          <ReportsSellerMetricsTab metrics={sellerMetrics} />
        </TabsContent>

        <TabsContent value="lost">
          <ReportsLostOpportunitiesTab opportunities={lostOpportunities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
