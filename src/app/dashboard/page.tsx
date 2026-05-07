"use client";

import { useNotes } from "@/lib/store";
import { NoteList } from "@/components/notes/NoteList";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const { activeNotes, batchDelete, batchArchive } = useNotes();

  return (
    <div className="flex h-full w-full">
      <div className="w-full md:w-[350px] md:border-r h-full overflow-hidden bg-muted/10">
        <NoteList 
          notes={activeNotes}
          basePath="/dashboard/notes"
          enableBatchDelete
          enableBatchArchive
          onBatchDelete={batchDelete}
          onBatchArchive={batchArchive}
        />
      </div>
      
      <div className="hidden md:flex flex-1 items-center justify-center bg-background/50">
        <EmptyState 
          title="No note selected" 
          description="Select a note from the list on the left or create a new one to start writing."
          icon={<FileText className="h-10 w-10 text-muted-foreground/50" />}
        />
      </div>
    </div>
  );
}
