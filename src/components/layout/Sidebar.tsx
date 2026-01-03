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
  Menu, 
  X,
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
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoTryvia from '@/assets/logo_tryvia.png';

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
      path: '/admin/global-dashboard',
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
      path: '/monitor',
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
                  "w-10 h-10 mx-auto",
                  active && "bg-primary/10 text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
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
            "w-full justify-start gap-3 h-10",
            active && "bg-primary/10 text-primary font-medium"
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Button>
      </Link>
    );
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <img src={logoTryvia} alt="Tryvia" className="h-8" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(collapsed && "mx-auto")}
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {/* Main Navigation */}
            {mainNavItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}

            {/* CRM Section */}
            {hasCrmAccess && (
              <>
                <div className="my-3 border-t border-sidebar-border" />
                
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/crm/pipeline">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "w-10 h-10 mx-auto",
                            isActiveGroup('/crm') && "bg-primary/10 text-primary"
                          )}
                        >
                          <Users className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      CRM
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Collapsible open={crmExpanded} onOpenChange={setCrmExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between h-10",
                          isActiveGroup('/crm') && "bg-primary/10 text-primary"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Users className="h-5 w-5" />
                          CRM
                        </span>
                        {crmExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-1 mt-1">
                      {crmNavItems.map((item) => (
                        <NavItem key={item.path} icon={item.icon} label={item.label} path={item.path} />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </>
            )}
          </nav>
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-border px-2 py-4 space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </aside>
    </TooltipProvider>
  );
}
