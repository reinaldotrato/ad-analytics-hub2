import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Building2, Briefcase, FileText, Plus, MoreVertical, CheckCircle2, Circle, Download, Trash2, Pencil, Upload, Loader2, Star, X, Link2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DetailData, DetailEntityType } from '../../hooks/useDetailData';
import { ContactFormDialog } from '../contacts/ContactFormDialog';
import { CompanyFormDialog } from '../companies/CompanyFormDialog';
import { TaskFormDialog } from '../deals/TaskFormDialog';
import { LinkExistingContactDialog } from '../deals/LinkExistingContactDialog';
import { 
  useCreateContact, 
  useUpdateDeal, 
  useCreateCompany, 
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateContact,
  useUpdateCompany,
  useDealFiles,
  useUploadDealFile,
  useDeleteDealFile,
  useAddDealContact,
  useRemoveDealContact,
  useSetPrimaryDealContact,
  useAddDealCompany,
  useRemoveDealCompany,
  useSetPrimaryDealCompany,
  type CrmContact,
  type CrmCompany,
  type CrmTask,
} from '@/hooks/useCrmData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DetailRightPanelProps {
  type: DetailEntityType;
  data: DetailData;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function DetailRightPanel({ type, data }: DetailRightPanelProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dialogs state
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [linkContactDialogOpen, setLinkContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);
  const [editingCompany, setEditingCompany] = useState<CrmCompany | null>(null);
  const [editingTask, setEditingTask] = useState<CrmTask | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkingContact, setIsLinkingContact] = useState(false);
  
  // Mutations
  const createContact = useCreateContact();
  const createCompany = useCreateCompany();
  const createTask = useCreateTask();
  const updateDeal = useUpdateDeal();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateContact = useUpdateContact();
  const updateCompany = useUpdateCompany();
  
  // Deal Contacts (Many-to-Many)
  const addDealContact = useAddDealContact();
  const removeDealContact = useRemoveDealContact();
  const setPrimaryDealContact = useSetPrimaryDealContact();
  
  // Deal Companies (Many-to-Many)
  const addDealCompany = useAddDealCompany();
  const removeDealCompany = useRemoveDealCompany();
  const setPrimaryDealCompany = useSetPrimaryDealCompany();
  
  // Files
  const { data: files = [], isLoading: isLoadingFiles } = useDealFiles(type === 'deal' ? data.id : undefined);
  const uploadFile = useUploadDealFile();
  const deleteFile = useDeleteDealFile();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSaveContact = (contactData: Partial<CrmContact>) => {
    if (editingContact?.id) {
      updateContact.mutate(
        { id: editingContact.id, updates: contactData },
        {
          onSuccess: () => {
            toast.success('Contato atualizado com sucesso');
            queryClient.invalidateQueries({ queryKey: ['crm-detail', type, data.id] });
            setEditingContact(null);
            setContactDialogOpen(false);
          },
          onError: () => {
            toast.error('Erro ao atualizar contato');
          },
        }
      );
    } else {
      // Criar novo contato e vincular ao deal via crm_deal_contacts
      createContact.mutate(contactData as Omit<CrmContact, 'id' | 'created_at' | 'updated_at' | 'client_id' | 'company'>, {
        onSuccess: (newContact) => {
          if (type === 'deal' && newContact?.id) {
            // Verificar se é o primeiro contato (será primário automaticamente)
            const isFirst = !data.dealContacts || data.dealContacts.length === 0;
            
            // Vincular via tabela many-to-many
            addDealContact.mutate(
              { dealId: data.id, contactId: newContact.id, isPrimary: isFirst },
              {
                onSuccess: () => {
                  toast.success('Contato criado e vinculado com sucesso');
                  // Atualizar também o contact_id do deal para compatibilidade
                  if (isFirst) {
                    updateDeal.mutate({ id: data.id, updates: { contact_id: newContact.id } });
                  }
                  queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
                  setContactDialogOpen(false);
                },
                onError: () => {
                  toast.error('Contato criado mas erro ao vincular ao negócio');
                },
              }
            );
          } else {
            toast.success('Contato criado com sucesso');
            setContactDialogOpen(false);
          }
        },
        onError: () => {
          toast.error('Erro ao criar contato');
        },
      });
    }
  };

  const handleRemoveContact = (contactId: string) => {
    removeDealContact.mutate(
      { dealId: data.id, contactId },
      {
        onSuccess: () => {
          toast.success('Contato removido do negócio');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
        onError: () => {
          toast.error('Erro ao remover contato');
        },
      }
    );
  };

  const handleSetPrimaryContact = (contactId: string) => {
    setPrimaryDealContact.mutate(
      { dealId: data.id, contactId },
      {
        onSuccess: () => {
          // Atualizar também o contact_id do deal para compatibilidade
          updateDeal.mutate({ id: data.id, updates: { contact_id: contactId } });
          toast.success('Contato definido como principal');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
        onError: () => {
          toast.error('Erro ao definir contato principal');
        },
      }
    );
  };

  const handleLinkExistingContact = (contactId: string) => {
    setIsLinkingContact(true);
    const isFirst = !data.dealContacts || data.dealContacts.length === 0;
    
    addDealContact.mutate(
      { dealId: data.id, contactId, isPrimary: isFirst },
      {
        onSuccess: () => {
          toast.success('Contato vinculado com sucesso');
          if (isFirst) {
            updateDeal.mutate({ id: data.id, updates: { contact_id: contactId } });
          }
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
          setLinkContactDialogOpen(false);
          setIsLinkingContact(false);
        },
        onError: () => {
          toast.error('Erro ao vincular contato');
          setIsLinkingContact(false);
        },
      }
    );
  };

  const handleSaveCompany = (companyData: Partial<CrmCompany>) => {
    if (editingCompany?.id) {
      updateCompany.mutate(
        { id: editingCompany.id, updates: companyData },
        {
          onSuccess: () => {
            toast.success('Empresa atualizada com sucesso');
            queryClient.invalidateQueries({ queryKey: ['crm-detail', type, data.id] });
            setEditingCompany(null);
            setCompanyDialogOpen(false);
          },
          onError: () => {
            toast.error('Erro ao atualizar empresa');
          },
        }
      );
    } else {
      // Criar nova empresa e vincular ao deal via crm_deal_companies
      createCompany.mutate(companyData as Omit<CrmCompany, 'id' | 'created_at' | 'updated_at' | 'client_id'>, {
        onSuccess: (newCompany) => {
          if (type === 'deal' && newCompany?.id) {
            // Verificar se é a primeira empresa (será primária automaticamente)
            const isFirst = !data.dealCompanies || data.dealCompanies.length === 0;
            
            // Vincular via tabela many-to-many
            addDealCompany.mutate(
              { dealId: data.id, companyId: newCompany.id, isPrimary: isFirst },
              {
                onSuccess: () => {
                  toast.success('Empresa criada e vinculada com sucesso');
                  queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
                  queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
                  setCompanyDialogOpen(false);
                },
                onError: () => {
                  toast.error('Empresa criada mas erro ao vincular ao negócio');
                },
              }
            );
          } else {
            toast.success('Empresa criada com sucesso');
            queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
            queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
            setCompanyDialogOpen(false);
          }
        },
        onError: () => {
          toast.error('Erro ao criar empresa');
        },
      });
    }
  };

  const handleRemoveCompany = (companyId: string) => {
    removeDealCompany.mutate(
      { dealId: data.id, companyId },
      {
        onSuccess: () => {
          toast.success('Empresa removida do negócio');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
        onError: () => {
          toast.error('Erro ao remover empresa');
        },
      }
    );
  };

  const handleSetPrimaryCompany = (companyId: string) => {
    setPrimaryDealCompany.mutate(
      { dealId: data.id, companyId },
      {
        onSuccess: () => {
          toast.success('Empresa definida como principal');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
        onError: () => {
          toast.error('Erro ao definir empresa principal');
        },
      }
    );
  };

  const handleSaveTask = (taskData: Partial<CrmTask>) => {
    if (editingTask?.id) {
      updateTask.mutate(
        { id: editingTask.id, updates: taskData },
        {
          onSuccess: () => {
            toast.success('Tarefa atualizada');
            queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
            setEditingTask(null);
            setTaskDialogOpen(false);
          },
          onError: () => {
            toast.error('Erro ao atualizar tarefa');
          },
        }
      );
    } else {
      createTask.mutate(
        { ...taskData, deal_id: data.id } as Omit<CrmTask, 'id' | 'created_at' | 'client_id'>,
        {
          onSuccess: () => {
            toast.success('Tarefa criada com sucesso');
            queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
          },
          onError: () => {
            toast.error('Erro ao criar tarefa');
          },
        }
      );
    }
  };

  const handleToggleTask = (task: { id: string; completed: boolean }) => {
    updateTask.mutate(
      { id: task.id, updates: { completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null } },
      {
        onSuccess: () => {
          toast.success(task.completed ? 'Tarefa reaberta' : 'Tarefa concluída');
          queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
        },
      }
    );
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        toast.success('Tarefa excluída');
        queryClient.invalidateQueries({ queryKey: ['crm-detail', 'deal', data.id] });
      },
      onError: () => {
        toast.error('Erro ao excluir tarefa');
      },
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use PDF, DOC, DOCX, XLS, XLSX, JPG ou PNG.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    setIsUploading(true);

    try {
      await uploadFile.mutateAsync({ dealId: data.id, file });
      toast.success('Arquivo enviado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['deal-files', data.id] });
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data: downloadData, error } = await supabase.storage
        .from('crm-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(downloadData);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleDeleteFile = (file: { id: string; file_path: string }) => {
    deleteFile.mutate(
      { fileId: file.id, filePath: file.file_path, dealId: data.id },
      {
        onSuccess: () => {
          toast.success('Arquivo excluído');
          queryClient.invalidateQueries({ queryKey: ['deal-files', data.id] });
        },
        onError: () => {
          toast.error('Erro ao excluir arquivo');
        },
      }
    );
  };

  const openEditContact = (contact: { id: string; name: string; email?: string; phone?: string; mobile_phone?: string }) => {
    setEditingContact(contact as CrmContact);
    setContactDialogOpen(true);
  };

  const openEditCompany = (company: { id: string; name: string; phone?: string; cnpj?: string }) => {
    setEditingCompany(company as CrmCompany);
    setCompanyDialogOpen(true);
  };

  const openEditTask = (task: CrmTask) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const openNewContact = () => {
    setEditingContact(null);
    setContactDialogOpen(true);
  };

  const openNewCompany = () => {
    setEditingCompany(null);
    setCompanyDialogOpen(true);
  };

  const openNewTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Card de Contatos (apenas para Deal) */}
      {type === 'deal' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User size={18} />
                Contatos
                {data.dealContacts && data.dealContacts.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{data.dealContacts.length}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary"
                  onClick={() => setLinkContactDialogOpen(true)}
                  title="Vincular contato existente"
                >
                  <Link2 size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary"
                  onClick={openNewContact}
                  title="Novo contato"
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {data.dealContacts && data.dealContacts.length > 0 ? (
              <div className="space-y-2">
                {data.dealContacts.map((dealContact) => (
                  <div key={dealContact.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{dealContact.contact?.name}</p>
                          {dealContact.is_primary && (
                            <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1">
                              <Star size={10} className="fill-current" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        {dealContact.contact?.email && (
                          <p className="text-sm text-muted-foreground">{dealContact.contact.email}</p>
                        )}
                        {dealContact.contact?.phone && (
                          <p className="text-sm text-muted-foreground">{dealContact.contact.phone}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dealContact.contact && openEditContact(dealContact.contact)}>
                            <Pencil size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {!dealContact.is_primary && (
                            <DropdownMenuItem onClick={() => handleSetPrimaryContact(dealContact.contact_id)}>
                              <Star size={14} className="mr-2" />
                              Definir como principal
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveContact(dealContact.contact_id)}
                            className="text-destructive"
                          >
                            <X size={14} className="mr-2" />
                            Remover do negócio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum contato vinculado</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Empresas (para Deal e Contact) */}
      {type !== 'company' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 size={18} />
                Empresas
                {type === 'deal' && data.dealCompanies && data.dealCompanies.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{data.dealCompanies.length}</Badge>
                )}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary"
                onClick={openNewCompany}
              >
                <Plus size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {type === 'deal' && data.dealCompanies && data.dealCompanies.length > 0 ? (
              <div className="space-y-2">
                {data.dealCompanies.map((dealCompany) => (
                  <div key={dealCompany.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground text-sm">{dealCompany.company?.name}</p>
                          {dealCompany.is_primary && (
                            <Badge variant="outline" className="text-xs py-0 px-1.5 gap-1">
                              <Star size={10} className="fill-current" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        {dealCompany.company?.cnpj && (
                          <p className="text-sm text-muted-foreground">{dealCompany.company.cnpj}</p>
                        )}
                        {dealCompany.company?.phone && (
                          <p className="text-sm text-muted-foreground">{dealCompany.company.phone}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => dealCompany.company && openEditCompany(dealCompany.company)}>
                            <Pencil size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {!dealCompany.is_primary && (
                            <DropdownMenuItem onClick={() => handleSetPrimaryCompany(dealCompany.company_id)}>
                              <Star size={14} className="mr-2" />
                              Definir como principal
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveCompany(dealCompany.company_id)}
                            className="text-destructive"
                          >
                            <X size={14} className="mr-2" />
                            Remover do negócio
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : type !== 'deal' && data.company ? (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{data.company.name}</p>
                    {data.company.cnpj && (
                      <p className="text-sm text-muted-foreground">{data.company.cnpj}</p>
                    )}
                    {data.company.phone && (
                      <p className="text-sm text-muted-foreground">{data.company.phone}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => data.company && openEditCompany(data.company)}>
                        <Pencil size={14} className="mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma empresa vinculada</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Negócios (para Contato/Empresa) */}
      {type !== 'deal' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase size={18} />
                Negócios
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                <Plus size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.deals && data.deals.length > 0 ? (
              <div className="space-y-2">
                {data.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 bg-muted rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{deal.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatCurrency(deal.value)} • {deal.status || 'Aberto'}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum negócio vinculado</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Tarefas (apenas para Deal) */}
      {type === 'deal' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 size={18} />
                Tarefas
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary"
                onClick={openNewTask}
              >
                <Plus size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data.tasks && data.tasks.length > 0 ? (
              <div className="space-y-2">
                {data.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-muted rounded-lg flex items-start gap-3"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className="text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditTask(task as CrmTask)}>
                          <Pencil size={14} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleTask(task)}>
                          <CheckCircle2 size={14} className="mr-2" />
                          {task.completed ? 'Reabrir' : 'Concluir'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card de Arquivos */}
      {type === 'deal' && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText size={18} />
                Arquivos
              </CardTitle>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-muted rounded-lg flex items-center gap-3"
                  >
                    <FileText size={18} className="text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownloadFile(file.file_path, file.file_name)}
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDeleteFile(file)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Nenhum arquivo encontrado</p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máx. 5MB)</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ContactFormDialog
        open={contactDialogOpen}
        onOpenChange={(open) => {
          setContactDialogOpen(open);
          if (!open) setEditingContact(null);
        }}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      <CompanyFormDialog
        open={companyDialogOpen}
        onOpenChange={(open) => {
          setCompanyDialogOpen(open);
          if (!open) setEditingCompany(null);
        }}
        company={editingCompany}
        onSave={handleSaveCompany}
      />

      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        dealId={data.id}
        onSave={handleSaveTask}
      />

      {/* Dialog para vincular contato existente */}
      <LinkExistingContactDialog
        open={linkContactDialogOpen}
        onOpenChange={setLinkContactDialogOpen}
        onSelect={handleLinkExistingContact}
        excludeContactIds={data.dealContacts?.map(dc => dc.contact_id) || []}
        isLinking={isLinkingContact}
      />
    </div>
  );
}

export default DetailRightPanel;
