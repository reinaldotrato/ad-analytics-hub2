import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, FEATURES } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  LayoutDashboard, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  PieChart,
  Globe,
  HeadphonesIcon,
  Activity,
  Building2,
  CalendarDays,
  Target,
  BarChart3,
  Contact,
  Kanban,
  ChevronDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [crmExpanded, setCrmExpanded] = useState(false);
  const location = useLocation();
  const { role, hasFeature } = useAuth();

  // Expand CRM menu if on CRM route
  useEffect(() => {
    if (location.pathname.startsWith('/crm')) {
      setCrmExpanded(true);
    }
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isActiveGroup = (prefix: string) => location.pathname.startsWith(prefix);

  // Navigation items based on permissions
  const mainNavItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      visible: hasFeature(FEATURES.DASHBOARD_COMPLETE) || hasFeature(FEATURES.DASHBOARD_EXECUTIVE),
    },
    {
      icon: PieChart,
      label: 'Visão Executiva',
      path: '/client-dashboard',
      visible: hasFeature(FEATURES.DASHBOARD_EXECUTIVE),
    },
    {
      icon: Globe,
      label: 'Visão Global',
      path: '/admin-global',
      visible: hasFeature(FEATURES.GLOBAL_VIEW) || role === 'admin',
    },
  ].filter(item => item.visible);

  const crmNavItems = [
    { icon: Kanban, label: 'Pipeline', path: '/crm/pipeline', feature: FEATURES.CRM_PIPELINE },
    { icon: Contact, label: 'Contatos', path: '/crm/contacts', feature: FEATURES.CRM_CONTACTS },
    { icon: Building2, label: 'Empresas', path: '/crm/companies', feature: FEATURES.CRM_COMPANIES },
    { icon: CalendarDays, label: 'Calendário', path: '/crm/calendar', feature: FEATURES.CRM_CALENDAR },
    { icon: Target, label: 'Metas', path: '/crm/goals', feature: FEATURES.CRM_GOALS },
    { icon: TrendingUp, label: 'Produtividade', path: '/crm/productivity', feature: FEATURES.CRM_PRODUCTIVITY },
    { icon: BarChart3, label: 'Relatórios', path: '/crm/reports', feature: FEATURES.CRM_REPORTS },
    { icon: Settings, label: 'Config CRM', path: '/crm/settings', feature: FEATURES.CRM_SETTINGS },
  ].filter(item => hasFeature(item.feature));

  const bottomNavItems = [
    {
      icon: HeadphonesIcon,
      label: 'Suporte',
      path: '/support',
      visible: hasFeature(FEATURES.SUPPORT_TICKETS) || role === 'admin',
    },
    {
      icon: Activity,
      label: 'Monitor',
      path: '/system-monitor',
      visible: role === 'admin',
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/settings',
      visible: hasFeature(FEATURES.APP_SETTINGS) || role === 'admin',
    },
  ].filter(item => item.visible);

  const hasCrmAccess = crmNavItems.length > 0;

  const NavItem = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => {
    const active = isActive(path);
    
    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to={path}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-10 h-10 mx-auto transition-all duration-200",
                  "hover:scale-105 hover:bg-primary/5 active:scale-95",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-5 w-5 transition-transform duration-200" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="animate-scale-in">
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link to={path}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 transition-all duration-200",
            "hover:scale-[1.02] hover:translate-x-1 hover:bg-primary/5 active:scale-[0.98]",
            active && "bg-primary/10 text-primary"
          )}
        >
          <Icon className={cn(
            "h-5 w-5 shrink-0 transition-transform duration-200",
            "group-hover:scale-110"
          )} />
          <span className={cn(
            "transition-all duration-300 ease-out whitespace-nowrap",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            {label}
          </span>
        </Button>
      </Link>
    );
  };

  // Section label component with animation
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(
      "overflow-hidden transition-all duration-300 ease-out",
      collapsed ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-2"
    )}>
      <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {children}
      </p>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen border-r border-border bg-sidebar",
          "transition-[width] duration-300 ease-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            <Link to="/dashboard" className="flex items-center gap-2">
              <img 
                src="/images/logo-positiva.png" 
                alt="Tryvia" 
                className="h-8 dark:hidden"
              />
              <img 
                src="/images/logo-negativa.png" 
                alt="Tryvia" 
                className="h-8 hidden dark:block"
              />
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 transition-all duration-300 ease-out hover:bg-primary/10",
              collapsed && "mx-auto"
            )}
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform duration-300 ease-out",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <div className="px-3 space-y-6">
            {/* Main Navigation */}
            {mainNavItems.length > 0 && (
              <div className="space-y-1">
                <SectionLabel>Dashboards</SectionLabel>
                {mainNavItems.map((item) => (
                  <NavItem key={item.path} {...item} />
                ))}
              </div>
            )}

            {/* CRM Section */}
            {hasCrmAccess && (
              <div className="space-y-1">
                <SectionLabel>CRM</SectionLabel>
                {collapsed ? (
                  // Collapsed: show only icons
                  crmNavItems.map((item) => (
                    <NavItem key={item.path} icon={item.icon} label={item.label} path={item.path} />
                  ))
                ) : (
                  // Expanded: show collapsible menu
                  <Collapsible open={crmExpanded} onOpenChange={setCrmExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between h-10 transition-all duration-200",
                          isActiveGroup('/crm') && "bg-primary/10 text-primary"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Users className="h-5 w-5 shrink-0" />
                          <span className="transition-opacity duration-300">CRM</span>
                        </span>
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform duration-300 ease-out",
                          !crmExpanded && "-rotate-90"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-1 mt-1 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      {crmNavItems.map((item, index) => (
                        <div 
                          key={item.path}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <NavItem icon={item.icon} label={item.label} path={item.path} />
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}

            {/* Bottom Navigation */}
            {bottomNavItems.length > 0 && (
              <div className="space-y-1">
                <SectionLabel>Sistema</SectionLabel>
                {bottomNavItems.map((item) => (
                  <NavItem key={item.path} {...item} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}
