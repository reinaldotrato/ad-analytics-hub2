import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, canAccessDashboards, canAccessCrm, canAccessGlobalView, canAccessSupport, canAccessAppSettings, canAccessCrmSettings, canAccessCrmAdvanced } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
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
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [crmExpanded, setCrmExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();

  // Expand CRM menu if on CRM route
  useEffect(() => {
    if (location.pathname.startsWith('/crm')) {
      setCrmExpanded(true);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  const navItems = [
    // Admin Global View
    ...(canAccessGlobalView(role) ? [
      { path: '/admin/global-dashboard', label: 'Visão Global', icon: Globe }
    ] : []),
    // Dashboard (for analysts and managers)
    ...(canAccessDashboards(role) ? [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ] : []),
    // Client Dashboard (for everyone)
    { path: '/client-dashboard', label: 'Meu Dashboard', icon: PieChart },
  ];

  const crmNavItems = canAccessCrm(role) ? [
    { path: '/crm/pipeline', label: 'Pipeline', icon: Kanban },
    { path: '/crm/dashboard', label: 'Dashboard CRM', icon: BarChart3 },
    { path: '/crm/reports', label: 'Relatórios', icon: TrendingUp },
    { path: '/crm/contacts', label: 'Contatos', icon: Contact },
    { path: '/crm/companies', label: 'Empresas', icon: Building2 },
    { path: '/crm/calendar', label: 'Calendário', icon: CalendarDays },
    ...(canAccessCrmAdvanced(role) ? [
      { path: '/crm/goals', label: 'Metas', icon: Target },
      { path: '/crm/team-productivity', label: 'Produtividade', icon: Users },
    ] : []),
    ...(canAccessCrmSettings(role) ? [
      { path: '/crm/settings', label: 'Configurações CRM', icon: Settings },
    ] : []),
  ] : [];

  const bottomNavItems = [
    ...(canAccessSupport(role) ? [
      { path: '/support-tickets', label: 'Suporte', icon: HeadphonesIcon }
    ] : []),
    ...(canAccessGlobalView(role) ? [
      { path: '/system-monitor', label: 'Monitor', icon: Activity }
    ] : []),
    ...(canAccessAppSettings(role) ? [
      { path: '/settings', label: 'Configurações', icon: Settings }
    ] : []),
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo-negativa.png" alt="Logo" className="h-8" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", !sidebarOpen && "justify-center px-2")}
                >
                  <item.icon className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              </Link>
            ))}

            {/* CRM Collapsible Section */}
            {crmNavItems.length > 0 && (
              <>
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start", !sidebarOpen && "justify-center px-2")}
                  onClick={() => setCrmExpanded(!crmExpanded)}
                >
                  <Users className="h-4 w-4" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-2 flex-1 text-left">CRM</span>
                      {crmExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>
                {(crmExpanded || !sidebarOpen) && (
                  <div className={cn("space-y-1", sidebarOpen && "ml-4")}>
                    {crmNavItems.map((item) => (
                      <Link key={item.path} to={item.path}>
                        <Button
                          variant={location.pathname === item.path ? "secondary" : "ghost"}
                          className={cn("w-full justify-start", !sidebarOpen && "justify-center px-2")}
                          size="sm"
                        >
                          <item.icon className="h-4 w-4" />
                          {sidebarOpen && <span className="ml-2">{item.label}</span>}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {bottomNavItems.length > 0 && (
              <>
                <Separator className="my-2" />
                {bottomNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", !sidebarOpen && "justify-center px-2")}
                    >
                      <item.icon className="h-4 w-4" />
                      {sidebarOpen && <span className="ml-2">{item.label}</span>}
                    </Button>
                  </Link>
                ))}
              </>
            )}
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("w-full justify-start", !sidebarOpen && "justify-center px-2")}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="ml-2 flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-16"
      )}>
        <div className="container mx-auto p-6">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
