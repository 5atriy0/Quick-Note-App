"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  isTrashed: boolean;
  updatedAt: string;
};

const DUMMY_NOTES: Note[] = [
  {
    id: "1",
    title: "Project Requirements",
    content: "We need to build a blazing fast note taking app. Must support offline mode.",
    tags: ["work", "planning"],
    isArchived: false,
    isTrashed: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Grocery List",
    content: "- Milk\n- Eggs\n- Bread\n- Coffee beans",
    tags: ["personal"],
    isArchived: false,
    isTrashed: false,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "Old Ideas",
    content: "Build a social network for cats.",
    tags: ["ideas"],
    isArchived: true,
    isTrashed: false,
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

interface NotesContextType {
  notes: Note[];
  activeNotes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  addNote: (note: Partial<Note>) => string;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  permanentlyDeleteNote: (id: string) => void;
  getNote: (id: string) => Note | undefined;
  batchDelete: (ids: string[]) => void;
  batchRestore: (ids: string[]) => void;
  batchArchive: (ids: string[]) => void;
  batchPermanentDelete: (ids: string[]) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Load from local storage or use dummy
    const saved = localStorage.getItem("quicknotes-mock");
    if (saved) {
      // Filter out any corrupted notes that were saved with id "new"
      const parsed: Note[] = JSON.parse(saved);
      const clean = parsed.filter(n => n.id !== "new");
      setNotes(clean.length > 0 ? clean : DUMMY_NOTES);
    } else {
      setNotes(DUMMY_NOTES);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem("quicknotes-mock", JSON.stringify(notes));
    }
  }, [notes]);

  const activeNotes = notes.filter(n => !n.isArchived && !n.isTrashed).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const archivedNotes = notes.filter(n => n.isArchived && !n.isTrashed);
  const trashedNotes = notes.filter(n => n.isTrashed);

  const addNote = (note: Partial<Note>) => {
    const id = Math.random().toString(36).substring(7);
    const newNote: Note = {
      title: note.title || "",
      content: note.content || "",
      tags: note.tags || [],
      isArchived: false,
      isTrashed: false,
      updatedAt: new Date().toISOString(),
      ...note,
      id,
    };
    setNotes(prev => [newNote, ...prev]);
    return id;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    updateNote(id, { isTrashed: true, isArchived: false });
  };

  const restoreNote = (id: string) => {
    updateNote(id, { isTrashed: false, isArchived: false });
  };

  const permanentlyDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getNote = (id: string) => {
    return notes.find(n => n.id === id);
  };

  const batchDelete = (ids: string[]) => {
    setNotes(prev => prev.map(n => ids.includes(n.id) ? { ...n, isTrashed: true, isArchived: false, updatedAt: new Date().toISOString() } : n));
  };

  const batchRestore = (ids: string[]) => {
    setNotes(prev => prev.map(n => ids.includes(n.id) ? { ...n, isTrashed: false, isArchived: false, updatedAt: new Date().toISOString() } : n));
  };

  const batchArchive = (ids: string[]) => {
    setNotes(prev => prev.map(n => ids.includes(n.id) ? { ...n, isTrashed: false, isArchived: true, updatedAt: new Date().toISOString() } : n));
  };

  const batchPermanentDelete = (ids: string[]) => {
    setNotes(prev => prev.filter(n => !ids.includes(n.id)));
  };

  return (
    <NotesContext.Provider value={{
      notes, activeNotes, archivedNotes, trashedNotes,
      addNote, updateNote, deleteNote, restoreNote, permanentlyDeleteNote, getNote,
      batchDelete, batchRestore, batchArchive, batchPermanentDelete
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
