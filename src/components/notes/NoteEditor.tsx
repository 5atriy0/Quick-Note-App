"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Trash2, Archive, Loader2, Tag as TagIcon, Check, Pin, PinOff, Maximize2, Minimize2, Eye, Edit3, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark-dimmed.css";
import { useNotes, Note } from "@/lib/store";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function NoteEditor() {
  const router = useRouter();
  const { getNote, updateNote, deleteNote, addNote, restoreNote, permanentlyDeleteNote, activeNoteId: noteId, setActiveNoteId } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isCommittedRef = useRef(false);

  const loadNote = useCallback(() => {
    if (noteId === "new") {
      isCommittedRef.current = false;
      setNote({
        id: "new",
        title: "",
        content: "",
        tags: [],
        isArchived: false,
        isTrashed: false,
        isPinned: false,
        updatedAt: new Date().toISOString()
      });
      setIsPreviewMode(false);
    } else if (noteId) {
      isCommittedRef.current = true;
      const existing = getNote(noteId);
      if (existing) {
        setNote({ ...existing });
      } else {
        setActiveNoteId(null);
      }
    }
  }, [noteId, getNote, setActiveNoteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = (updates: Partial<Note>) => {
    setIsSaving(true);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      if (noteId === "new" && !isCommittedRef.current) {
        if (updates.title || updates.content) {
          isCommittedRef.current = true;
          const newId = addNote({ ...note, ...updates });
          setActiveNoteId(newId);
        }
      } else if (noteId && noteId !== "new") {
        updateNote(noteId, updates);
      }
      setIsSaving(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!note) return;
    
    const updatedNote = { ...note, [name]: value };
    setNote(updatedNote);
    handleSave({ [name]: value });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && note) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!note.tags.includes(newTag)) {
        const newTags = [...note.tags, newTag];
        setNote({ ...note, tags: newTags });
        handleSave({ tags: newTags });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!note) return;
    const newTags = note.tags.filter(t => t !== tagToRemove);
    setNote({ ...note, tags: newTags });
    handleSave({ tags: newTags });
  };

  const handleTrash = () => {
    if (noteId === "new") return setActiveNoteId(null);
    if (!noteId) return;
    deleteNote(noteId);
    setActiveNoteId(null);
  };

  const handleArchive = () => {
    if (noteId === "new") return setActiveNoteId(null);
    if (!noteId) return;
    updateNote(noteId, { isArchived: true, isTrashed: false, isPinned: false });
    setActiveNoteId(null);
  };

  const handleRestore = () => {
    if (!noteId) return;
    restoreNote(noteId);
    setActiveNoteId(null);
  };

  const handlePermanentDelete = () => {
    if (!noteId) return;
    if (confirm("Are you sure? This note will be permanently deleted and cannot be recovered.")) {
      permanentlyDeleteNote(noteId);
      setActiveNoteId(null);
    }
  };

  const togglePin = () => {
    if (!note) return;
    const newPinned = !note.isPinned;
    setNote({ ...note, isPinned: newPinned });
    handleSave({ isPinned: newPinned });
  };


  // Close fullscreen on unmount or activeNote changes
  useEffect(() => {
    if (!noteId) setIsFullscreen(false);
  }, [noteId]);

  if (!note) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className={cn("flex flex-col bg-background animate-in fade-in zoom-in-95 duration-200", isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "h-full relative")}>
      <header className="flex items-center justify-between border-b px-4 py-3 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setActiveNoteId(null)} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {isSaving ? (
              <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>
            ) : (
              <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Saved</span>
            )}
            <span className="hidden sm:inline">
              • Last edited {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Action Buttons for Normal State */}
          {!note.isTrashed && !note.isArchived && (
            <>

              <Button variant="ghost" size="icon" onClick={togglePin} title={note.isPinned ? "Unpin Note" : "Pin Note"}>
                {note.isPinned ? <Pin className="h-4 w-4 fill-primary text-primary" /> : <PinOff className="h-4 w-4" />}
              </Button>
            </>
          )}

          <div className="w-px h-4 bg-border mx-1" />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            className="mr-1 h-8 flex items-center gap-2"
          >
            {isPreviewMode ? <><Edit3 className="h-4 w-4" /> Edit</> : <><Eye className="h-4 w-4" /> Preview</>}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Trash view: show Restore + Permanent Delete */}
          {note.isTrashed && (
            <>
              <Button variant="outline" size="sm" onClick={handleRestore} className="ml-1 mr-1 h-8 gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </Button>
              <Button variant="danger" size="sm" onClick={handlePermanentDelete} className="h-8 gap-1">
                <Trash2 className="h-3.5 w-3.5" /> Delete Forever
              </Button>
            </>
          )}

          {/* Archive view: show Restore */}
          {note.isArchived && !note.isTrashed && (
            <>
              <Button variant="outline" size="sm" onClick={handleRestore} className="ml-1 mr-1 h-8 gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Restore
              </Button>
              <Button variant="ghost" size="icon" onClick={handleTrash} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Active view: show Archive + Trash */}
          {!note.isArchived && !note.isTrashed && (
            <>
              <Button variant="ghost" size="icon" onClick={handleArchive} title="Archive">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleTrash} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-8">
        <input
          name="title"
          value={note.title}
          onChange={handleChange}
          placeholder="Note Title"
          className="w-full border-none bg-transparent text-3xl sm:text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 mb-6"
          disabled={isPreviewMode}
        />

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <TagIcon className="h-4 w-4 text-muted-foreground" />
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 px-2 py-1 bg-primary/10 text-primary cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors group" onClick={() => !isPreviewMode && handleRemoveTag(tag)}>
              {tag}
              {!isPreviewMode && <span className="opacity-0 group-hover:opacity-100 -mr-1">×</span>}
            </Badge>
          ))}
          {!isPreviewMode && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground min-w-[120px]"
            />
          )}
        </div>

        {isPreviewMode ? (
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
                  if (!src) return <span className="text-muted-foreground italic">[Image: {alt || "no source"}]</span>;
                  // eslint-disable-next-line @next/next/no-img-element
                  return <img src={src} alt={alt} {...props} className="max-w-full h-auto rounded-lg my-4 border shadow-sm" />;
                },
              }}
            >
              {note.content || "*Empty note*"}
            </ReactMarkdown>
          </div>
        ) : (
          <Textarea
            name="content"
            value={note.content}
            onChange={handleChange}
            placeholder="Start typing your note here... (Markdown supported)"
            className="min-h-[500px] w-full resize-none border-none bg-transparent text-base sm:text-lg leading-relaxed focus-visible:ring-0 px-0 placeholder:text-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}
