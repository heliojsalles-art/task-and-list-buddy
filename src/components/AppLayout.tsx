import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import bgGradient from "@/assets/bg-gradient.jpg";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div
        className="min-h-screen flex w-full"
        style={{
          backgroundImage: `url(${bgGradient})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center px-4 shrink-0 glass-subtle border-b border-border/40">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
