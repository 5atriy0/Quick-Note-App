"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckSquare, X, Trash2, RotateCcw, Archive, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { NoteCard } from "./NoteCard";
import { Note, useNotes } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

interface NoteListProps {
  notes: Note[];
  activeNoteId?: string;
  basePath?: string;
  enableBatchDelete?: boolean;
  enableBatchRestore?: boolean;
  enableBatchArchive?: boolean;
  enableBatchPermanentDelete?: boolean;
  onBatchDelete?: (ids: string[]) => void;
  onBatchRestore?: (ids: string[]) => void;
  onBatchArchive?: (ids: string[]) => void;
  onBatchPermanentDelete?: (ids: string[]) => void;
}

type ModalAction = "delete" | "archive" | "restore" | "permanent_delete" | null;

export function NoteList({ 
  notes, 
  activeNoteId,
  basePath = "/dashboard/notes",
  enableBatchDelete,
  enableBatchRestore,
  enableBatchArchive,
  enableBatchPermanentDelete,
  onBatchDelete,
  onBatchRestore,
  onBatchArchive,
  onBatchPermanentDelete,
}: NoteListProps) {
  const router = useRouter();
  const { setActiveNoteId } = useNotes();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Modal state
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Clear selection if mode changes or notes empty
  useEffect(() => {
    if (!isSelectionMode) setSelectedIds(new Set());
  }, [isSelectionMode]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) || 
    note.content.toLowerCase().includes(search.toLowerCase()) ||
    note.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.size === filteredNotes.length && filteredNotes.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotes.map(n => n.id)));
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const processAction = () => {
    if (selectedIds.size === 0 || !modalAction) return;
    
    setIsProcessing(true);
    const ids = Array.from(selectedIds);
    
    // Simulate slight delay for better UX
    setTimeout(() => {
      if (modalAction === "delete") onBatchDelete?.(ids);
      if (modalAction === "archive") onBatchArchive?.(ids);
      if (modalAction === "restore") onBatchRestore?.(ids);
      if (modalAction === "permanent_delete") onBatchPermanentDelete?.(ids);
      
      setIsProcessing(false);
      setIsSuccess(true);
      
      setTimeout(() => {
        setIsSuccess(false);
        setModalAction(null);
        exitSelectionMode();
      }, 1500);
    }, 600);
  };

  const hasBatchActions = enableBatchDelete || enableBatchRestore || enableBatchArchive || enableBatchPermanentDelete;
  const isAllSelected = selectedIds.size === filteredNotes.length && filteredNotes.length > 0;

  return (
    <div className="flex h-full flex-col relative">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {isSelectionMode ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={exitSelectionMode} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{selectedIds.size} selected</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSelectAllToggle} className="text-xs h-8">
                {isAllSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {enableBatchArchive && (
                <Button variant="outline" size="sm" onClick={() => setModalAction("archive")} disabled={selectedIds.size === 0} className="h-8 gap-1 shrink-0">
                  <Archive className="h-3.5 w-3.5" /> Archive
                </Button>
              )}
              {enableBatchRestore && (
                <Button variant="outline" size="sm" onClick={() => setModalAction("restore")} disabled={selectedIds.size === 0} className="h-8 gap-1 shrink-0">
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </Button>
              )}
              {enableBatchDelete && (
                <Button variant="danger" size="sm" onClick={() => setModalAction("delete")} disabled={selectedIds.size === 0} className="h-8 gap-1 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              )}
              {enableBatchPermanentDelete && (
                <Button variant="danger" size="sm" onClick={() => setModalAction("permanent_delete")} disabled={selectedIds.size === 0} className="h-8 gap-1 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Forever
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-8 bg-muted/50 border-none focus-visible:ring-1 focus-visible:bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {hasBatchActions && notes.length > 0 && (
              <Button variant="ghost" size="icon" onClick={() => setIsSelectionMode(true)} className="h-10 w-10 shrink-0" title="Select multiple">
                <CheckSquare className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {search ? "No notes found matching your search." : "You don't have any notes yet."}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              isActive={note.id === activeNoteId}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.has(note.id)}
              onSelect={toggleSelect}
              onClick={() => {
                if (note.id === activeNoteId) {
                  setActiveNoteId(null);
                } else {
                  setActiveNoteId(note.id);
                }
              }}
            />
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalAction && (
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
                  <p className="text-sm font-medium">
                    {modalAction === "delete" || modalAction === "permanent_delete" ? "Notes deleted successfully!" :
                     modalAction === "archive" ? "Notes archived successfully!" :
                     "Notes restored successfully!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {modalAction === "delete" || modalAction === "permanent_delete" ? "Delete Notes" :
                     modalAction === "archive" ? "Archive Notes" : "Restore Notes"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to {modalAction === "permanent_delete" ? "permanently delete" : modalAction} {selectedIds.size} selected note(s)?
                    {modalAction === "permanent_delete" && " This action cannot be undone."}
                  </p>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setModalAction(null)} disabled={isProcessing}>
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      variant={modalAction.includes("delete") ? "danger" : "default"} 
                      className="flex-1" 
                      onClick={processAction} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm"}
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
