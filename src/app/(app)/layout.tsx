import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebarContent from '@/components/layout/app-sidebar-content';
import EnsureAuth from '@/components/auth/ensure-auth';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
        <EnsureAuth />
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar collapsible="icon">
            <AppSidebarContent />
          </Sidebar>
          <SidebarInset>
            {children}
          </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
