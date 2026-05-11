"use client";

import { usePathname } from "next/navigation";
import { Hexagon } from "lucide-react";

export function MobileHeader() {
  const pathname = usePathname();

  // Hide MobileHeader if we are inside a specific note editor to give full screen to editor
  const isInsideNote = pathname.startsWith("/dashboard/notes/") || 
    pathname.startsWith("/dashboard/archive/notes/") || 
    pathname.startsWith("/dashboard/trash/notes/");

  if (isInsideNote) {
    return null;
  }

  return (
    <div className="md:hidden flex items-center justify-center h-14 border-b bg-card/80 backdrop-blur-lg px-4 flex-shrink-0 z-30">
      <div className="flex items-center gap-2">
        <Hexagon className="h-5 w-5 text-primary fill-primary/20" />
        <span className="font-bold text-base tracking-tight">QuickNote</span>
      </div>
    </div>
  );
}
