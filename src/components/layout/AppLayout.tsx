import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SupportChatWidget } from '@/components/support/SupportChatWidget';
import { cn } from '@/lib/utils';

export interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Determine if we need custom scroll behavior (e.g., for Kanban)
  const isKanbanRoute = location.pathname === '/crm/pipeline';
  const isCrmRoute = location.pathname.startsWith('/crm');

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        
        <main 
          className={cn(
            "flex-1",
            isKanbanRoute 
              ? "overflow-hidden" 
              : "overflow-auto"
          )}
        >
          <div className={cn(
            isKanbanRoute 
              ? "h-full" 
              : "p-6"
          )}>
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Support Widget - only show on CRM routes */}
      {isCrmRoute && <SupportChatWidget />}
    </div>
  );
}
