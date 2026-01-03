import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield } from 'lucide-react';
import { AccessGroupsTab } from './AccessGroupsTab';
import { FeaturesTab } from './FeaturesTab';

export function PermissionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Gerenciamento de Permissões</h2>
        <p className="text-muted-foreground">Configure grupos de acesso e funcionalidades do sistema</p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList>
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Grupos de Acesso
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Shield className="h-4 w-4" />
            Funcionalidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-4">
          <AccessGroupsTab />
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <FeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
