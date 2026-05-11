"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Archive, Trash2, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotes } from "@/lib/store";

const navItems = [
  { name: "Notes", href: "/dashboard", icon: FileText, exact: true },
  { name: "Archive", href: "/dashboard/archive", icon: Archive, exact: false },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2, exact: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide BottomNav in mobile if we are inside a specific note editor to give full screen to editor
  const isInsideNote = pathname.startsWith("/dashboard/notes/") || 
    pathname.startsWith("/dashboard/archive/notes/") || 
    pathname.startsWith("/dashboard/trash/notes/");

  if (isInsideNote) {
    return null;
  }

  // Show FAB only on pages where creating a note makes sense
  const showNewNoteFab = pathname === "/dashboard" || pathname === "/dashboard/";
  const { setActiveNoteId } = useNotes();
  const router = useRouter();

  const handleNewNote = () => {
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
    setActiveNoteId("new");
  };

  return (
    <>
      {/* Floating Action Button for New Note (mobile only) */}
      {showNewNoteFab && (
        <button
          onClick={handleNewNote}
          className="md:hidden fixed right-4 bottom-20 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all"
          aria-label="New Note"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/80 backdrop-blur-lg pb-safe">
        <nav className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

