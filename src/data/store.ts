// Browser-storage version of the database, for the prototype.
// M4 replaces this file with Firebase; nothing outside src/data/ changes.

import { sampleData } from './seed'
import type { AppData, PersonId } from './types'

// Bump the number when the saved shape changes, so old browser data is replaced.
const DATA_KEY = 'family-list-prototype-v2'
// Who you're "signed in" as. Kept per tab, so two tabs can be two people.
const VIEWER_KEY = 'family-list-viewer'
const DEFAULT_VIEWER: PersonId = 'brady'

export interface Snapshot {
  data: AppData
  viewerId: PersonId
}

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(DATA_KEY)
    if (raw) return JSON.parse(raw) as AppData
  } catch {
    // Storage blocked or unreadable: fall back to the sample data.
  }
  return sampleData()
}

function loadViewer(): PersonId {
  try {
    return sessionStorage.getItem(VIEWER_KEY) ?? DEFAULT_VIEWER
  } catch {
    return DEFAULT_VIEWER
  }
}

let snapshot: Snapshot = { data: loadData(), viewerId: loadViewer() }
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

function save() {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(snapshot.data))
    sessionStorage.setItem(VIEWER_KEY, snapshot.viewerId)
  } catch {
    // Storage blocked: changes still work until the page reloads.
  }
  notify()
}

export function getSnapshot(): Snapshot {
  return snapshot
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function commit(change: (data: AppData) => AppData) {
  snapshot = { ...snapshot, data: change(snapshot.data) }
  save()
}

export function setViewerId(viewerId: PersonId) {
  snapshot = { ...snapshot, viewerId }
  save()
}

export function resetData() {
  snapshot = { ...snapshot, data: sampleData() }
  save()
}

// Another tab saved a change: pick it up, so open windows stay in sync.
window.addEventListener('storage', (event) => {
  if (event.key === DATA_KEY) {
    snapshot = { ...snapshot, data: loadData() }
    notify()
  }
})
