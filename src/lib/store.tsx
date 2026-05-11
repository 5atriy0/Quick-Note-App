"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { db, type LocalNote } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

// ----- Public Types -----
export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isArchived: boolean;
  isTrashed: boolean;
  isPinned: boolean;
  updatedAt: string;
};

interface NotesContextType {
  notes: Note[];
  activeNotes: Note[];
  archivedNotes: Note[];
  trashedNotes: Note[];
  isLoading: boolean;
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
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

// ----- Mapping Helpers (snake_case DB ↔ camelCase TS) -----
function toNote(row: LocalNote): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    isArchived: row.is_archived,
    isTrashed: row.is_trashed,
    isPinned: row.is_pinned ?? false,
    updatedAt: row.updated_at,
  };
}

// ----- Context -----
const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const supabase = useRef(createClient()).current;

  // ---------- 1. Get current user & initial load ----------
  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        let currentUserId = session?.user?.id;

        // Offline Fallback: If session fetch fails but we have a stored user ID, use it
        if (!currentUserId) {
          const stored = localStorage.getItem('quicknote_last_user_id');
          if (stored) currentUserId = stored;
        } else {
          // Store for future offline use
          localStorage.setItem('quicknote_last_user_id', currentUserId);
        }

        if (!currentUserId) {
          setIsLoading(false);
          return;
        }

        setUserId(currentUserId);
        setIsLoading(false);

        // Fetch initial data from server if online
        if (navigator.onLine) {
          syncFromServer(currentUserId);
        }
      } catch (err) {
        console.error('Session init failed:', err);
        // Fallback
        const stored = localStorage.getItem('quicknote_last_user_id');
        if (stored) {
          setUserId(stored);
        }
        setIsLoading(false);
      }
    }

    initSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- 2. Reactive Dexie Query (Offline-First) ----------
  const rawNotes = useLiveQuery(
    () => {
      if (!userId) return [];
      return db.notes
        .where('user_id').equals(userId)
        .and(n => n._sync_status !== 'deleted')
        .toArray();
    },
    [userId],
    []
  );

  const notes = React.useMemo(() => rawNotes.map(toNote), [rawNotes]);

  // ---------- 3. Server Sync Logic ----------
  const pushPendingChanges = async (uid: string) => {
    try {
      // Ambil data tanpa compound index untuk menghindari warning Dexie
      const allLocal = await db.notes.where('user_id').equals(uid).toArray();
      const pending = allLocal.filter(n => n._sync_status === 'pending');
      const toDelete = allLocal.filter(n => n._sync_status === 'deleted');

      for (const note of pending) {
        const { _sync_status, ...payload } = note;
        void _sync_status;
        const { error } = await supabase.from('notes').upsert(payload, { onConflict: 'id' });
        if (!error) {
          await db.notes.update(note.id, { _sync_status: 'synced' });
        }
      }

      for (const note of toDelete) {
        const { error } = await supabase.from('notes').delete().eq('id', note.id);
        if (!error) {
          await db.notes.delete(note.id);
        }
      }
    } catch (err) {
      console.error('Sync push failed:', err);
    }
  };

  const syncFromServer = async (uid: string) => {
    try {
      // PUSH DULU: Pastikan perubahan lokal dikirim ke server sebelum mengambil data terbaru
      await pushPendingChanges(uid);

      const { data: remoteNotes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', uid);

      if (!error && remoteNotes) {
        // Ambil data lokal untuk melihat mana yang sedang "pending"
        const allLocal = await db.notes.where('user_id').equals(uid).toArray();
        const pendingIds = new Set(
          allLocal.filter(n => n._sync_status === 'pending' || n._sync_status === 'deleted').map(n => n.id)
        );

        // Upsert data dari server ke lokal (HANYA JIKA tidak ada pending lokal, agar offline edit tidak tertimpa)
        const locals: LocalNote[] = [];
        const remoteIds = new Set(remoteNotes.map((r: any) => r.id));
        
        for (const r of remoteNotes as any[]) {
          if (!pendingIds.has(r.id)) {
            locals.push({
              id: r.id as string,
              user_id: r.user_id as string,
              title: r.title as string,
              content: r.content as string,
              tags: (r.tags as string[]) ?? [],
              is_archived: r.is_archived as boolean,
              is_trashed: r.is_trashed as boolean,
              is_pinned: (r.is_pinned as boolean) ?? false,
              created_at: r.created_at as string,
              updated_at: r.updated_at as string,
              _sync_status: 'synced' as const,
            });
          }
        }

        if (locals.length > 0) {
          await db.notes.bulkPut(locals);
        }

        // Hapus catatan lokal yang statusnya "synced" tapi sudah tidak ada di server
        const localSynced = allLocal.filter(n => n._sync_status === 'synced');
        for (const local of localSynced) {
          if (!remoteIds.has(local.id)) {
            await db.notes.delete(local.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync from server:", err);
    }
  };

  // Online listener to trigger push
  useEffect(() => {
    const handleOnline = () => {
      if (userId) pushPendingChanges(userId);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [userId]);

  const pushSingleUpdate = async (localNote: LocalNote, action: 'upsert' | 'delete') => {
    if (!navigator.onLine) return; // Will be caught by online listener later
    try {
      if (action === 'upsert') {
        const { _sync_status, ...payload } = localNote;
        void _sync_status;
        const { error } = await supabase.from('notes').upsert(payload, { onConflict: 'id' });
        if (!error) {
          await db.notes.update(localNote.id, { _sync_status: 'synced' });
        }
      } else {
        const { error } = await supabase.from('notes').delete().eq('id', localNote.id);
        if (!error) {
          await db.notes.delete(localNote.id);
        }
      }
    } catch (err) {
      // Ignore, stays pending
    }
  };

  // ---------- 4. Computed lists ----------
  const activeNotes = React.useMemo(() => {
    return notes
      .filter(n => !n.isArchived && !n.isTrashed)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes]);
  const archivedNotes = React.useMemo(() => notes.filter(n => n.isArchived && !n.isTrashed), [notes]);
  const trashedNotes = React.useMemo(() => notes.filter(n => n.isTrashed), [notes]);

  // ---------- 5. CRUD Operations (local-first) ----------
  const addNote = (note: Partial<Note>) => {
    const id = crypto.randomUUID();
    const uid = userId ?? '';
    const now = new Date().toISOString();
    const local: LocalNote = {
      id,
      user_id: uid,
      title: note.title ?? '',
      content: note.content ?? '',
      tags: note.tags ?? [],
      is_archived: false,
      is_trashed: false,
      is_pinned: note.isPinned ?? false,
      created_at: now,
      updated_at: now,
      _sync_status: 'pending',
    };

    // Write to Dexie (UI updates instantly via useLiveQuery)
    db.notes.put(local).then(() => pushSingleUpdate(local, 'upsert')).catch(console.error);
    return id;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    
    (async () => {
      const existing = await db.notes.get(id);
      if (!existing) return;

      const updatedLocal: Partial<LocalNote> = { updated_at: now, _sync_status: 'pending' as const };
      if (updates.title !== undefined) updatedLocal.title = updates.title;
      if (updates.content !== undefined) updatedLocal.content = updates.content;
      if (updates.tags !== undefined) updatedLocal.tags = updates.tags;
      if (updates.isArchived !== undefined) updatedLocal.is_archived = updates.isArchived;
      if (updates.isTrashed !== undefined) updatedLocal.is_trashed = updates.isTrashed;
      if (updates.isPinned !== undefined) updatedLocal.is_pinned = updates.isPinned;

      await db.notes.update(id, updatedLocal);
      const full = await db.notes.get(id);
      if (full) pushSingleUpdate(full, 'upsert');
    })().catch(console.error);
  };

  const deleteNote = (id: string) => updateNote(id, { isTrashed: true, isArchived: false, isPinned: false });
  const restoreNote = (id: string) => updateNote(id, { isTrashed: false, isArchived: false });

  const permanentlyDeleteNote = (id: string) => {
    (async () => {
      const existing = await db.notes.get(id);
      if (existing) {
        await db.notes.update(id, { _sync_status: 'deleted' });
        pushSingleUpdate(existing, 'delete');
      }
    })().catch(console.error);
  };

  const getNote = (id: string) => notes.find(n => n.id === id);

  // ---------- 6. Batch Operations ----------
  const batchDelete = (ids: string[]) => ids.forEach(id => deleteNote(id));
  const batchRestore = (ids: string[]) => ids.forEach(id => restoreNote(id));
  const batchArchive = (ids: string[]) => ids.forEach(id => updateNote(id, { isTrashed: false, isArchived: true, isPinned: false }));
  const batchPermanentDelete = (ids: string[]) => ids.forEach(id => permanentlyDeleteNote(id));

  return (
    <NotesContext.Provider value={{
      notes, activeNotes, archivedNotes, trashedNotes, isLoading,
      activeNoteId, setActiveNoteId,
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
