import { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebarContent from '@/components/layout/app-sidebar-content';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen bg-background text-foreground">
          <Sidebar>
            <AppSidebarContent />
          </Sidebar>
          <SidebarInset>
            {children}
          </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
