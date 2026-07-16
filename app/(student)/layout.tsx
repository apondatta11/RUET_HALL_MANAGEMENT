// app/(student)/layout.tsx
import { AppSidebar } from "@/components/layout/Sidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#060e20]">
        {/* Fixed sidebar — 68px collapsed, 260px on hover */}
        <AppSidebar />

        {/* Main area — dynamically pushed by the sticky sidebar */}
        <div className="flex flex-col flex-1 min-w-0">
          <DashboardTopbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
