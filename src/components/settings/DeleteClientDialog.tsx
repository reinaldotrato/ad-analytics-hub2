import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Database, Users, Key, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Client,
  DeletionSummary,
  getClientDeletionPreview,
  deleteClientComplete,
} from '@/services/clientsService';

interface DeleteClientDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteClientDialog({ client, open, onOpenChange, onSuccess }: DeleteClientDialogProps) {
  const [summary, setSummary] = useState<DeletionSummary | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (open && client) {
      setConfirmText('');
      setSummary(null);
      setIsLoadingPreview(true);

      getClientDeletionPreview(client.id)
        .then((data) => setSummary(data.summary))
        .catch((err) => console.error('Error loading preview:', err))
        .finally(() => setIsLoadingPreview(false));
    }
  }, [open, client]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteClientComplete(client!.id),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const canDelete = confirmText === 'EXCLUIR';

  const totalCrmData = summary
    ? summary.crmData.deals +
      summary.crmData.contacts +
      summary.crmData.companies +
      summary.crmData.tasks +
      summary.crmData.funnels +
      summary.crmData.products
    : 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Excluir Cliente Permanentemente
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Você está prestes a excluir o cliente <strong>"{client?.name}"</strong> e todos os dados associados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoadingPreview ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando informações...</span>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <p className="text-sm font-medium text-destructive">
                Esta ação irá excluir PERMANENTEMENTE:
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{summary.tables.length}</strong> tabelas de dados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{summary.users.length}</strong> usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{summary.credentials}</strong> credenciais</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{totalCrmData}</strong> registros CRM</span>
                </div>
              </div>

              {summary.users.length > 0 && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Usuários que serão excluídos:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {summary.users.map((u) => (
                        <li key={u.id}>{u.email}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {summary.tables.length > 0 && (
                <>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Tabelas que serão excluídas:</p>
                    <div className="flex flex-wrap gap-1">
                      {summary.tables.slice(0, 10).map((t) => (
                        <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {t}
                        </span>
                      ))}
                      {summary.tables.length > 10 && (
                        <span className="text-xs text-muted-foreground">
                          +{summary.tables.length - 10} mais...
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm">
                Digite <strong>EXCLUIR</strong> para confirmar:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR"
                className="font-mono"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">
            Não foi possível carregar as informações do cliente.
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={!canDelete || deleteMutation.isPending || isLoadingPreview}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir Permanentemente'
            )}
          </Button>
        </AlertDialogFooter>

        {deleteMutation.isError && (
          <p className="text-sm text-destructive mt-2">
            Erro: {(deleteMutation.error as Error).message}
          </p>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
