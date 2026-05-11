"use client";

import { useNotes } from "@/lib/store";
import { NoteList } from "@/components/notes/NoteList";
import { Trash2, Check } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function TrashPage() {
  const { trashedNotes, permanentlyDeleteNote, batchRestore, batchPermanentDelete, activeNoteId } = useNotes();
  const [modalAction, setModalAction] = useState<"empty" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleEmptyTrash = () => {
    setIsProcessing(true);
    setTimeout(() => {
      trashedNotes.forEach(note => permanentlyDeleteNote(note.id));
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setModalAction(null);
      }, 1500);
    }, 600);
  };

  return (
    <div className="flex h-full w-full">
      <div className={`w-full md:w-[350px] md:border-r h-full overflow-hidden bg-muted/10 flex-col ${activeNoteId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b bg-background flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold tracking-tight">Trash</h2>
            <span className="text-xs text-muted-foreground">{trashedNotes.length} note(s)</span>
          </div>
          {trashedNotes.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setModalAction("empty")} className="text-destructive text-xs h-8">
              Empty All
            </Button>
          )}
        </div>
        {trashedNotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
             <EmptyState 
              title="Trash is empty" 
              description="Notes you delete will appear here."
              icon={<Trash2 className="h-10 w-10 text-muted-foreground/50" />}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
             <NoteList 
               notes={trashedNotes}
               enableBatchRestore
               enableBatchPermanentDelete
               onBatchRestore={batchRestore}
               onBatchPermanentDelete={batchPermanentDelete}
             />
          </div>
        )}
      </div>
      
      <div className={`flex-1 h-full overflow-hidden ${activeNoteId ? 'block' : 'hidden md:flex items-center justify-center bg-background/50'}`}>
        {activeNoteId ? (
          <NoteEditor />
        ) : (
          <EmptyState 
            title="Trash" 
            description="Select a deleted note to view, restore, or permanently delete it."
            icon={<Trash2 className="h-10 w-10 text-muted-foreground/50" />}
          />
        )}
      </div>

      <AnimatePresence>
        {modalAction === "empty" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !isProcessing && !isSuccess && setModalAction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-lg shadow-xl w-full max-w-sm p-6 text-center"
            >
              {isSuccess ? (
                <div className="flex flex-col items-center py-4 gap-3">
                  <Check className="h-12 w-12 text-green-500" />
                  <p className="text-sm font-medium">Trash emptied successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Empty Trash</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to permanently delete all {trashedNotes.length} item(s) in trash? This cannot be undone.
                  </p>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModalAction(null)} disabled={isProcessing}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      variant="danger"
                      className="flex-1" 
                      onClick={handleEmptyTrash} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Emptying..." : "Empty All"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
