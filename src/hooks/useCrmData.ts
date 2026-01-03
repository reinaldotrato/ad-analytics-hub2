import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as crmService from '@/services/crmService';
import type { CrmContact, CrmCompany, CrmDeal, CrmFunnelStage, CrmTask, CrmTaskWithContact, CrmTimelineEvent, CrmFunnel, CrmProduct, CrmLossReason, CrmCustomFieldDefinition, CrmDealFile } from '@/services/crmService';

// Get effective client ID for queries
function useEffectiveClientId() {
  const { clientId, selectedClientId, role } = useAuth();
  return role === 'admin' ? selectedClientId || clientId : clientId;
}

// =============================================
// Companies Hooks
// =============================================

export function useCompanies() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-companies', effectiveClientId],
    queryFn: () => crmService.getCompanies(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (company: Omit<CrmCompany, 'id' | 'created_at' | 'updated_at' | 'client_id'>) =>
      crmService.createCompany({ ...company, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmCompany> }) =>
      crmService.updateCompany(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
    },
  });
}

// =============================================
// Contacts Hooks
// =============================================

export function useContacts() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-contacts', effectiveClientId],
    queryFn: () => crmService.getContacts(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (contact: Omit<CrmContact, 'id' | 'created_at' | 'updated_at' | 'client_id' | 'company'>) =>
      crmService.createContact({ ...contact, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmContact> }) =>
      crmService.updateContact(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });
}

// =============================================
// Funnel Stages Hooks
// =============================================

export function useFunnelStagesSupabase() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-funnel-stages', effectiveClientId],
    queryFn: () => crmService.getFunnelStages(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useSeedFunnelStages() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: () => crmService.seedDefaultFunnelStages(effectiveClientId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnel-stages'] });
    },
  });
}

export function useCreateFunnelStage() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (stage: Omit<CrmFunnelStage, 'id' | 'created_at' | 'client_id'>) =>
      crmService.createFunnelStage({ ...stage, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnel-stages'] });
    },
  });
}

export function useUpdateFunnelStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmFunnelStage> }) =>
      crmService.updateFunnelStage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnel-stages'] });
    },
  });
}

export function useDeleteFunnelStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteFunnelStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnel-stages'] });
    },
  });
}

// =============================================
// Deals Hooks
// =============================================

export function useDealsSupabase() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-deals', effectiveClientId],
    queryFn: () => crmService.getDeals(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useDealByIdSupabase(dealId: string) {
  return useQuery({
    queryKey: ['crm-deal', dealId],
    queryFn: () => crmService.getDealById(dealId),
    enabled: !!dealId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (deal: Omit<CrmDeal, 'id' | 'created_at' | 'updated_at' | 'client_id' | 'contact' | 'funnel_stage' | 'assigned_to'>) =>
      crmService.createDeal({ ...deal, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmDeal> }) =>
      crmService.updateDeal(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      queryClient.invalidateQueries({ queryKey: ['crm-deal', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });
}

// =============================================
// Tasks Hooks
// =============================================

export function useTasks(dealId?: string) {
  const effectiveClientId = useEffectiveClientId();
  const { user, role } = useAuth();
  
  // crm_user only sees their own tasks
  const sellerId = role === 'crm_user' ? user?.id : undefined;
  
  return useQuery({
    queryKey: ['crm-tasks', effectiveClientId, dealId, sellerId],
    queryFn: () => crmService.getTasks(effectiveClientId!, dealId, sellerId),
    enabled: !!effectiveClientId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (task: Omit<CrmTask, 'id' | 'created_at' | 'client_id'>) =>
      crmService.createTask({ ...task, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmTask> }) =>
      crmService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) => crmService.bulkDeleteTasks(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
  });
}

// =============================================
// Timeline Hooks
// =============================================

export function useTimelineEvents(dealId: string) {
  return useQuery({
    queryKey: ['crm-timeline', dealId],
    queryFn: () => crmService.getTimelineEvents(dealId),
    enabled: !!dealId,
  });
}

export function useAllTimelineEvents() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-all-timeline', effectiveClientId],
    queryFn: () => crmService.getAllTimelineEvents(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (event: Omit<CrmTimelineEvent, 'id' | 'created_at' | 'client_id'>) =>
      crmService.createTimelineEvent({ ...event, client_id: effectiveClientId! }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-timeline', variables.deal_id] });
      queryClient.invalidateQueries({ queryKey: ['crm-all-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

// =============================================
// Funnels Hooks
// =============================================

export function useFunnels() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-funnels', effectiveClientId],
    queryFn: () => crmService.getFunnels(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useCreateFunnel() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (funnel: Omit<CrmFunnel, 'id' | 'created_at' | 'client_id'>) =>
      crmService.createFunnel({ ...funnel, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnels'] });
    },
  });
}

export function useUpdateFunnel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmFunnel> }) =>
      crmService.updateFunnel(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnels'] });
    },
  });
}

export function useDeleteFunnel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteFunnel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnels'] });
    },
  });
}

export function useSetDefaultFunnel() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (funnelId: string) => crmService.setDefaultFunnel(effectiveClientId!, funnelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-funnels'] });
    },
  });
}

// =============================================
// Products Hooks
// =============================================

export function useProducts() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-products', effectiveClientId],
    queryFn: () => crmService.getProducts(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (product: Omit<CrmProduct, 'id' | 'created_at' | 'updated_at' | 'client_id'>) =>
      crmService.createProduct({ ...product, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmProduct> }) =>
      crmService.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-products'] });
    },
  });
}

// =============================================
// Loss Reasons Hooks
// =============================================

export function useLossReasons() {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-loss-reasons', effectiveClientId],
    queryFn: () => crmService.getLossReasons(effectiveClientId!),
    enabled: !!effectiveClientId,
  });
}

export function useCreateLossReason() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (lossReason: Omit<CrmLossReason, 'id' | 'created_at' | 'updated_at' | 'client_id'>) =>
      crmService.createLossReason({ ...lossReason, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-loss-reasons'] });
    },
  });
}

export function useUpdateLossReason() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmLossReason> }) =>
      crmService.updateLossReason(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-loss-reasons'] });
    },
  });
}

export function useDeleteLossReason() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteLossReason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-loss-reasons'] });
    },
  });
}

// =============================================
// Custom Field Definitions Hooks
// =============================================

export function useCustomFieldDefinitions(entityType?: 'deal' | 'contact' | 'company') {
  const effectiveClientId = useEffectiveClientId();
  
  return useQuery({
    queryKey: ['crm-custom-fields', effectiveClientId, entityType],
    queryFn: () => crmService.getCustomFieldDefinitions(effectiveClientId!, entityType),
    enabled: !!effectiveClientId,
  });
}

export function useCreateCustomFieldDefinition() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: (field: Omit<CrmCustomFieldDefinition, 'id' | 'created_at' | 'updated_at' | 'client_id'>) =>
      crmService.createCustomFieldDefinition({ ...field, client_id: effectiveClientId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-custom-fields'] });
    },
  });
}

export function useUpdateCustomFieldDefinition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CrmCustomFieldDefinition> }) =>
      crmService.updateCustomFieldDefinition(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-custom-fields'] });
    },
  });
}

export function useDeleteCustomFieldDefinition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => crmService.deleteCustomFieldDefinition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-custom-fields'] });
    },
  });
}

// =============================================
// Deal Files Hooks
// =============================================

export function useDealFiles(dealId: string) {
  return useQuery({
    queryKey: ['crm-deal-files', dealId],
    queryFn: () => crmService.getDealFiles(dealId),
    enabled: !!dealId,
  });
}

export function useUploadDealFile() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: ({ file, dealId }: { file: File; dealId: string }) =>
      crmService.uploadDealFile(file, dealId, effectiveClientId!, user?.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-files', variables.dealId] });
    },
  });
}

export function useDeleteDealFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ fileId, filePath, dealId }: { fileId: string; filePath: string; dealId: string }) =>
      crmService.deleteDealFile(fileId, filePath),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-files', variables.dealId] });
    },
  });
}

export function useFileDownloadUrl() {
  return useMutation({
    mutationFn: (filePath: string) => crmService.getFileDownloadUrl(filePath),
  });
}

// =============================================
// Deal Contacts Hooks (Many-to-Many)
// =============================================

export function useDealContacts(dealId: string) {
  return useQuery({
    queryKey: ['crm-deal-contacts', dealId],
    queryFn: () => crmService.getDealContacts(dealId),
    enabled: !!dealId,
  });
}

export function useAddDealContact() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: ({ dealId, contactId, isPrimary }: { dealId: string; contactId: string; isPrimary?: boolean }) =>
      crmService.addDealContact(dealId, contactId, effectiveClientId!, isPrimary),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-contacts', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useRemoveDealContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, contactId }: { dealId: string; contactId: string }) =>
      crmService.removeDealContact(dealId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-contacts', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useSetPrimaryDealContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, contactId }: { dealId: string; contactId: string }) =>
      crmService.setPrimaryDealContact(dealId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-contacts', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

// =============================================
// Deal Companies Hooks (Many-to-Many)
// =============================================

export function useDealCompanies(dealId: string) {
  return useQuery({
    queryKey: ['crm-deal-companies', dealId],
    queryFn: () => crmService.getDealCompanies(dealId),
    enabled: !!dealId,
  });
}

export function useAddDealCompany() {
  const queryClient = useQueryClient();
  const effectiveClientId = useEffectiveClientId();
  
  return useMutation({
    mutationFn: ({ dealId, companyId, isPrimary }: { dealId: string; companyId: string; isPrimary?: boolean }) =>
      crmService.addDealCompany(dealId, companyId, effectiveClientId!, isPrimary),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-companies', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useRemoveDealCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, companyId }: { dealId: string; companyId: string }) =>
      crmService.removeDealCompany(dealId, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-companies', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

export function useSetPrimaryDealCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, companyId }: { dealId: string; companyId: string }) =>
      crmService.setPrimaryDealCompany(dealId, companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crm-deal-companies', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['crm-detail'] });
    },
  });
}

// Export types
export type { CrmContact, CrmCompany, CrmDeal, CrmFunnelStage, CrmTask, CrmTaskWithContact, CrmTimelineEvent, CrmFunnel, CrmProduct, CrmLossReason, CrmCustomFieldDefinition, CrmDealFile };
export type { CrmDealContact, CrmDealCompany } from '@/services/crmService';
