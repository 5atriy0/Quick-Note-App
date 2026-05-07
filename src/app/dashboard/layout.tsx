import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { OfflineStatus } from "@/components/layout/OfflineStatus";
import { NotesProvider } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotesProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <OfflineStatus />
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {children}
        </main>
        <BottomNav />
      </div>
    </NotesProvider>
  );
}

