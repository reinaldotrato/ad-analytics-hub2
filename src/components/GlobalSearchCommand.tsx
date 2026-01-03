import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Briefcase, User, Building2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const typeIcons: Record<string, React.ElementType> = {
  'Negócio': Briefcase,
  'Contato': User,
  'Empresa': Building2,
};

export function GlobalSearchCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, results, isLoading, clearSearch } = useGlobalSearch();

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    clearSearch();
    navigate(path);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      clearSearch();
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Buscar...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Buscar negócios, contatos, empresas..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isLoading && searchTerm.length > 2 && results.length === 0 && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}
          
          {!isLoading && searchTerm.length <= 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Digite pelo menos 3 caracteres para buscar
            </div>
          )}
          
          {!isLoading && Object.entries(groupedResults).map(([type, items]) => {
            const Icon = typeIcons[type] || Briefcase;
            return (
              <CommandGroup key={type} heading={type + 's'}>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleSelect(item.path)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
