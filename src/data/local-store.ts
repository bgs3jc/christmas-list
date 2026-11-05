// Browser-storage version of the database, for the prototype: no sign-in, a
// "Viewing as" bar picks who you are, and made-up sample data.

import type { Backend, CollectionName, Collections, Snapshot } from './backend'
import { sampleData } from './seed'
import type { AppData, PersonId } from './types'

// Bump the number when the saved shape changes, so old browser data is replaced.
const DATA_KEY = 'family-list-prototype-v9'
// Who you're "signed in" as. Kept per tab, so two tabs can be two people.
const VIEWER_KEY = 'family-list-viewer'
const DEFAULT_VIEWER: PersonId = 'brady'

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

export function createLocalStore() {
  let snapshot: Snapshot = { session: { status: 'ready' }, data: loadData(), viewerId: loadViewer() }
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

  function change<C extends CollectionName>(name: C, update: (records: Collections[C][]) => Collections[C][]) {
    const records = snapshot.data[name] as Collections[C][]
    snapshot = { ...snapshot, data: { ...snapshot.data, [name]: update(records) } }
    save()
  }

  // Another tab saved a change: pick it up, so open windows stay in sync.
  window.addEventListener('storage', (event) => {
    if (event.key === DATA_KEY) {
      snapshot = { ...snapshot, data: loadData() }
      notify()
    }
  })

  const backend: Backend = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    put(name, records) {
      const ids = new Set(records.map((r) => r.id))
      change(name, (all) => [...all.filter((r) => !ids.has(r.id)), ...records])
    },
    patch(name, id, patch) {
      change(name, (all) => all.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    },
    remove(name, id) {
      change(name, (all) => all.filter((r) => r.id !== id))
    },
  }

  return {
    backend,
    setViewerId(viewerId: PersonId) {
      snapshot = { ...snapshot, viewerId }
      save()
    },
    resetData() {
      snapshot = { ...snapshot, data: sampleData() }
      save()
    },
  }
}
