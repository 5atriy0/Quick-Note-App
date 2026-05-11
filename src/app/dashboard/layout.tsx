import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { OfflineStatus } from "@/components/layout/OfflineStatus";
import { NotesProvider } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotesProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background">
        <OfflineStatus />
        <Sidebar />
        <MobileHeader />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </NotesProvider>
  );
}

