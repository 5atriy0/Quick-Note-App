"use client";

import { useNotes } from "@/lib/store";
import { NoteList } from "@/components/notes/NoteList";
import { Archive as ArchiveIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function ArchivePage() {
  const { archivedNotes, batchRestore, activeNoteId } = useNotes();

  return (
    <div className="flex h-full w-full">
      <div className={`w-full md:w-[350px] md:border-r h-full overflow-hidden bg-muted/10 flex-col ${activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-background flex items-center gap-2">
          <ArchiveIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold tracking-tight">Archive</h2>
          <span className="text-xs text-muted-foreground ml-auto">{archivedNotes.length} note(s)</span>
        </div>
        {archivedNotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
             <EmptyState 
              title="Archive is empty" 
              description="Notes you archive will appear here."
              icon={<ArchiveIcon className="h-10 w-10 text-muted-foreground/50" />}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
             <NoteList 
               notes={archivedNotes}
               enableBatchRestore
               onBatchRestore={batchRestore}
             />
          </div>
        )}
      </div>
      
      <div className={`flex-1 h-full overflow-hidden ${activeNoteId ? 'block' : 'hidden md:flex items-center justify-center bg-background/50'}`}>
        {activeNoteId ? (
          <NoteEditor />
        ) : (
          <EmptyState 
            title="Archive" 
            description="Select an archived note to view or restore it."
            icon={<ArchiveIcon className="h-10 w-10 text-muted-foreground/50" />}
          />
        )}
      </div>
    </div>
  );
}
