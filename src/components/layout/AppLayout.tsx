import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SupportChatWidget } from '@/components/support/SupportChatWidget';
import { cn } from '@/lib/utils';

// Routes that need custom scroll behavior (e.g., Kanban with horizontal scroll)
const CUSTOM_SCROLL_ROUTES = ['/crm/pipeline'];

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  // Determine if we need custom scroll behavior
  const needsCustomScroll = CUSTOM_SCROLL_ROUTES.includes(location.pathname);
  const isCrmRoute = location.pathname.startsWith('/crm');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        
        <main 
          className={cn(
            "flex-1",
            needsCustomScroll ? "overflow-hidden" : "overflow-auto"
          )}
        >
          <div className={cn(
            needsCustomScroll ? "h-full" : "p-6"
          )}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Support Widget - only show on CRM routes */}
      {isCrmRoute && <SupportChatWidget />}
    </div>
  );
}
