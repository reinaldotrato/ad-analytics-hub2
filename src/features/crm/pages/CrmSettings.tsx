import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Layers, Package, FileSpreadsheet, Users, ThumbsDown, SlidersHorizontal } from 'lucide-react';
import { FunnelsTab } from '../components/settings/FunnelsTab';
import { StagesTab } from '../components/settings/StagesTab';
import { ProductsTab } from '../components/settings/ProductsTab';
import { ImportExportTab } from '../components/settings/ImportExportTab';
import { SellersTab } from '../components/settings/SellersTab';
import { LossReasonsTab } from '../components/settings/LossReasonsTab';
import { CustomFieldsTab } from '../components/settings/CustomFieldsTab';
import { useAuth } from '@/contexts/AuthContext';

export function CrmSettings() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações do CRM
        </h1>
        <p className="text-muted-foreground">Gerencie funis, etapas, produtos e vendedores do seu CRM</p>
      </div>

      <Tabs defaultValue="sellers" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="sellers" className="gap-2">
            <Users className="h-4 w-4" />
            Vendedores
          </TabsTrigger>
          <TabsTrigger value="funnels" className="gap-2">
            <Layers className="h-4 w-4" />
            Funis
          </TabsTrigger>
          <TabsTrigger value="stages" className="gap-2">
            <Layers className="h-4 w-4" />
            Etapas
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="loss-reasons" className="gap-2">
            <ThumbsDown className="h-4 w-4" />
            Motivos de Perda
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="custom-fields" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Campos Personalizados
            </TabsTrigger>
          )}
          <TabsTrigger value="import-export" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Importar/Exportar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sellers">
          <SellersTab />
        </TabsContent>

        <TabsContent value="funnels">
          <FunnelsTab />
        </TabsContent>

        <TabsContent value="stages">
          <StagesTab />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="loss-reasons">
          <LossReasonsTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="custom-fields">
            <CustomFieldsTab />
          </TabsContent>
        )}

        <TabsContent value="import-export">
          <ImportExportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
