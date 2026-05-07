"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Archive, Trash2, Settings, Plus, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

const navItems = [
  { name: "Active Notes", href: "/dashboard", icon: FileText, exact: true },
  { name: "Archive", href: "/dashboard/archive", icon: Archive, exact: false },
  { name: "Trash", href: "/dashboard/trash", icon: Trash2, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-sm px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <Hexagon className="h-6 w-6 text-primary fill-primary/20" />
        <span className="font-bold text-lg tracking-tight">QuickNote</span>
      </div>

      <Link href="/dashboard/notes/new" className="mb-6">
        <Button className="w-full justify-start gap-2" size="lg">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href || pathname.startsWith("/dashboard/notes/")
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/dashboard/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
