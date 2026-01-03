import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Search, Check, Loader2 } from 'lucide-react';
import { useContacts } from '@/hooks/useCrmData';

interface LinkExistingContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (contactId: string) => void;
  excludeContactIds?: string[];
  isLinking?: boolean;
}

export function LinkExistingContactDialog({
  open,
  onOpenChange,
  onSelect,
  excludeContactIds = [],
  isLinking = false,
}: LinkExistingContactDialogProps) {
  const [search, setSearch] = useState('');
  const { data: contacts = [], isLoading } = useContacts();

  const availableContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Excluir contatos já vinculados
      if (excludeContactIds.includes(contact.id)) return false;
      
      // Filtrar por busca
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [contacts, excludeContactIds, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular Contato Existente</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[300px] -mx-2 px-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {search ? 'Nenhum contato encontrado' : 'Todos os contatos já estão vinculados'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {availableContacts.map((contact) => (
                <Button
                  key={contact.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-3"
                  disabled={isLinking}
                  onClick={() => onSelect(contact.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      {contact.email && (
                        <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                      )}
                      {!contact.email && contact.phone && (
                        <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>
                      )}
                    </div>
                    {isLinking && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
