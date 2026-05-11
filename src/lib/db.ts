import Dexie, { type EntityTable } from 'dexie'

// Local IndexedDB schema for offline-first notes
export interface LocalNote {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  is_archived: boolean
  is_trashed: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  /** Sync status: 'synced' = matches server, 'pending' = needs push to server, 'deleted' = pending permanent delete */
  _sync_status: 'synced' | 'pending' | 'deleted'
}

class QuickNoteDB extends Dexie {
  notes!: EntityTable<LocalNote, 'id'>

  constructor() {
    super('QuickNoteDB')
    this.version(1).stores({
      notes: 'id, user_id, is_archived, is_trashed, updated_at, _sync_status',
    })
    this.version(2).stores({
      notes: 'id, user_id, is_archived, is_trashed, is_pinned, updated_at, _sync_status',
    })
  }
}

export const db = new QuickNoteDB()
