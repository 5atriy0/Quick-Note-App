"use client";

import { formatDistanceToNow } from "date-fns";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note } from "@/lib/store";
import { Badge } from "@/components/ui/Badge";

interface NoteCardProps {
  note: Note;
  isActive?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: (noteId: string) => void;
  onClick?: () => void;
}

export function NoteCard({ note, isActive, isSelected, isSelectionMode, onSelect, onClick }: NoteCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onSelect) {
      e.preventDefault();
      onSelect(note.id);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <div
        className={cn(
          "group flex flex-col gap-2 rounded-lg border p-4 text-left text-sm transition-all hover:bg-accent",
          isActive ? "bg-accent border-primary/50 shadow-sm" : "bg-card",
          isSelected && "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
        )}
      >
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center">
            {isSelectionMode && (
              <div className={cn(
                "flex items-center justify-center h-5 w-5 rounded border mr-2 transition-colors shrink-0",
                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
              )}>
                {isSelected && <span className="text-xs">✓</span>}
              </div>
            )}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="font-semibold line-clamp-1">{note.title || "Untitled Note"}</div>
              {note.isPinned && <Pin className="h-3 w-3 fill-primary text-primary shrink-0" />}
            </div>
            <div
              className={cn(
                "ml-auto text-xs shrink-0",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className="line-clamp-2 text-xs text-muted-foreground">
          {note.content.substring(0, 150) || "No content"}
        </div>
        {note.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
