"use client";

import { use } from "react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { useNotes } from "@/lib/store";
import { NoteList } from "@/components/notes/NoteList";

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { activeNotes, batchDelete, batchArchive } = useNotes();

  return (
    <div className="flex h-full w-full">
      <div className="hidden md:block md:w-[350px] md:border-r h-full overflow-hidden bg-muted/10">
        <NoteList 
          notes={activeNotes} 
          activeNoteId={resolvedParams.id}
          basePath="/dashboard/notes"
          enableBatchDelete
          enableBatchArchive
          onBatchDelete={batchDelete}
          onBatchArchive={batchArchive}
        />
      </div>
      
      <div className="w-full md:flex-1 h-full overflow-hidden">
        <NoteEditor noteId={resolvedParams.id} returnTo="/dashboard" />
      </div>
    </div>
  );
}
