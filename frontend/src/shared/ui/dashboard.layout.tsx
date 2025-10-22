import { Header } from "./header";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export function DashboardLayout() {
  const user = useSelector((state: any) => state.auth.user);
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
