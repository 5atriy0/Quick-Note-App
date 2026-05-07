"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Trash2, Archive, Loader2, Tag as TagIcon, Check, Image as ImageIcon, Video, Code, Paperclip, Eye, Edit3, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark-dimmed.css";
import { useNotes, Note } from "@/lib/store";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  noteId: string;
  /** Where to navigate back to after actions like trash/archive/restore */
  returnTo?: string;
}

export function NoteEditor({ noteId, returnTo = "/dashboard" }: NoteEditorProps) {
  const router = useRouter();
  const { getNote, updateNote, deleteNote, addNote, restoreNote, permanentlyDeleteNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        updatedAt: new Date().toISOString()
      });
      setIsPreviewMode(false);
    } else {
      isCommittedRef.current = true;
      const existing = getNote(noteId);
      if (existing) {
        setNote({ ...existing });
      } else {
        router.push(returnTo);
      }
    }
  }, [noteId, getNote, router, returnTo]);

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
          router.replace(`/dashboard/notes/${newId}`);
        }
      } else if (noteId !== "new") {
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
    if (noteId === "new") return router.push(returnTo);
    deleteNote(noteId);
    router.push(returnTo);
  };

  const handleArchive = () => {
    if (noteId === "new") return router.push(returnTo);
    updateNote(noteId, { isArchived: true, isTrashed: false });
    router.push(returnTo);
  };

  const handleRestore = () => {
    restoreNote(noteId);
    router.push(returnTo);
  };

  const handlePermanentDelete = () => {
    if (confirm("Are you sure? This note will be permanently deleted and cannot be recovered.")) {
      permanentlyDeleteNote(noteId);
      router.push(returnTo);
    }
  };

  const insertSnippet = (snippet: string) => {
    if (!note) return;
    const newContent = note.content + `\n\n${snippet}\n`;
    setNote({ ...note, content: newContent });
    handleSave({ content: newContent });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file";
      const snippet = fileType === "image" 
        ? `![${file.name}](mock_image_url)` 
        : `[${file.name}](mock_file_url)`;
      insertSnippet(snippet);
    }
  };

  if (!note) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="flex h-full flex-col bg-background animate-in fade-in zoom-in-95 duration-200 relative">
      <header className="flex items-center justify-between border-b px-4 py-3 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push(returnTo)} className="md:hidden">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            className="mr-2 h-8 flex items-center gap-2"
          >
            {isPreviewMode ? <><Edit3 className="h-4 w-4" /> Edit</> : <><Eye className="h-4 w-4" /> Preview</>}
          </Button>

          {/* Trash view: show Restore + Permanent Delete */}
          {note.isTrashed && (
            <>
              <Button variant="outline" size="sm" onClick={handleRestore} className="mr-1 h-8 gap-1">
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
              <Button variant="outline" size="sm" onClick={handleRestore} className="mr-1 h-8 gap-1">
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

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full pb-32">
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
                  return <img src={src} alt={alt} {...props} />;
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

      {/* Formatting & Upload Toolbar */}
      {!isPreviewMode && !note.isTrashed && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/80 backdrop-blur-lg border shadow-lg rounded-full px-4 py-2">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*,video/*"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()} title="Upload File">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary" onClick={() => insertSnippet("![Image description](https://example.com/image.png)")} title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary" onClick={() => insertSnippet("[Video](https://example.com/video.mp4)")} title="Insert Video">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary" onClick={() => insertSnippet("```javascript\n// Write your code here\n```")} title="Insert Code Block">
            <Code className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
