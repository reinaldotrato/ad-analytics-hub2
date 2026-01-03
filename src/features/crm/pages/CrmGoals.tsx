import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Users, History } from 'lucide-react';
import { GoalsOverviewTab } from '../components/goals/GoalsOverviewTab';
import { GoalsBySellerTab } from '../components/goals/GoalsBySellerTab';
import { GoalsHistoryTab } from '../components/goals/GoalsHistoryTab';

export function CrmGoals() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Metas</h1>
        <p className="text-muted-foreground">
          Defina e acompanhe as metas de vendas, leads e oportunidades
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas da Empresa
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Metas por Vendedor
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GoalsOverviewTab />
        </TabsContent>

        <TabsContent value="sellers">
          <GoalsBySellerTab />
        </TabsContent>

        <TabsContent value="history">
          <GoalsHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
