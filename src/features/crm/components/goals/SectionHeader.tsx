import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, icon: Icon, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
        {description && (
          <span className="text-xs text-muted-foreground/70">{description}</span>
        )}
      </div>
      {action}
    </div>
  );
}
