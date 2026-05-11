"use client";

import { useNotes } from "@/lib/store";
import { NoteList } from "@/components/notes/NoteList";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function DashboardPage() {
  const { activeNotes, batchDelete, batchArchive, activeNoteId, setActiveNoteId } = useNotes();

  return (
    <div className="flex h-full w-full">
      {/* List View: Hidden on mobile if a note is active */}
      <div className={`w-full md:w-[350px] md:border-r h-full overflow-hidden bg-muted/10 ${activeNoteId ? 'hidden md:block' : 'block'}`}>
        <NoteList 
          notes={activeNotes}
          enableBatchDelete
          enableBatchArchive
          onBatchDelete={batchDelete}
          onBatchArchive={batchArchive}
        />
      </div>
      
      {/* Editor View: Hidden on mobile if NO note is active */}
      <div className={`flex-1 h-full overflow-hidden ${activeNoteId ? 'block' : 'hidden md:flex items-center justify-center bg-background/50'}`}>
        {activeNoteId ? (
          <NoteEditor />
        ) : (
          <EmptyState 
            title="No note selected" 
            description="Select a note from the list on the left or create a new one to start writing."
            icon={<FileText className="h-10 w-10 text-muted-foreground/50" />}
          />
        )}
      </div>
    </div>
  );
}
