// What every storage backend does. There are two: browser storage for the
// prototype (local-store.ts) and Firebase for the real thing
// (firebase-store.ts). index.ts decides what to write; a backend just stores it.

import type { AppData, Gift, Idea, PersonId, WishItem } from './types'

// Where sign-in stands.
export type Session =
  // Checking who's signed in, or loading the family's lists.
  | { status: 'loading' }
  | { status: 'signed-out' }
  // Signed in, but this email isn't on the family list.
  | { status: 'not-family'; email: string }
  | { status: 'ready' }

export interface Snapshot {
  session: Session
  data: AppData
  viewerId: PersonId
}

// The three kinds of things people write. People and homes are set up by
// Brady in the database, never written by the site.
export interface Collections {
  wishes: WishItem
  gifts: Gift
  ideas: Idea
}
export type CollectionName = keyof Collections

export interface Backend {
  getSnapshot(): Snapshot
  subscribe(listener: () => void): () => void
  // Adds or replaces whole records.
  put<C extends CollectionName>(name: C, records: Collections[C][]): void
  // Changes some fields. A field set to undefined is cleared.
  patch<C extends CollectionName>(name: C, id: string, patch: Partial<Collections[C]>): void
  remove(name: CollectionName, id: string): void
}

export const emptyData: AppData = { people: [], homes: [], wishes: [], gifts: [], ideas: [] }

// Why signing in didn't work, for the sign-in page to explain.
export type SignInProblem =
  | 'popup-blocked' // the browser blocked Google's window
  | 'wrong-password' // the email and family password don't match (never says which)
  | 'too-many' // too many wrong tries; Firebase makes you wait
  | 'failed' // anything else, usually the connection

export class SignInError extends Error {
  problem: SignInProblem
  constructor(problem: SignInProblem) {
    super(problem)
    this.problem = problem
  }
}
