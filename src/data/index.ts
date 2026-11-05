// The data layer. Every read and write in the app goes through this file;
// components never touch storage or Firebase directly.
//
// Reads are shaped around who is looking. You only ever get your own list
// without claims, and you never get gifts or ideas about yourself. The
// Firestore rules (firestore.rules) enforce the same thing on the server.

import { useMemo, useSyncExternalStore } from 'react'
import { SignInError, type Session, type SignInProblem } from './backend'
import { backend, prototype, signIn } from './store'
import type { AppData, Gift, Home, Idea, Person, PersonId, WishItem } from './types'

export type * from './types'
export type { Session, SignInProblem }
export { SignInError }

const getSnapshot = backend.getSnapshot

function useSnapshot() {
  return useSyncExternalStore(backend.subscribe, getSnapshot)
}

// Pages only show once the session is ready, so there's always a viewer.
function viewerOf(data: AppData, viewerId: PersonId): Person {
  return data.people.find((p) => p.id === viewerId) ?? data.people[0] ?? { id: viewerId, name: '', homeId: '' }
}

// ---- Signing in ----

export function useSession(): Session {
  return useSnapshot().session
}

export const signInWithGoogle = signIn.withGoogle
export const sendSignInLink = signIn.sendLink
export const finishSignInLink = signIn.finishLink
export const signOut = signIn.signOut
// Real sign-in is on: there's someone to sign out.
export const canSignOut = !prototype

// Top picks first, then in the order they were added.
const byPriority = (a: WishItem, b: WishItem) => Number(b.topPick) - Number(a.topPick) || a.order - b.order
// Gifts in the order they were added; overheard notes newest first.
const oldestFirst = (a: Gift, b: Gift) => a.createdAt.localeCompare(b.createdAt)
const newestFirst = (a: Idea, b: Idea) => b.createdAt.localeCompare(a.createdAt)

function viewOf(data: AppData, person: Person): ShoppingView {
  return {
    person,
    wishes: data.wishes.filter((w) => w.ownerId === person.id).sort(byPriority),
    gifts: data.gifts.filter((g) => g.recipientId === person.id).sort(oldestFirst),
    ideas: data.ideas.filter((i) => i.aboutId === person.id).sort(newestFirst),
  }
}

// ---- Reads ----

export function useViewer(): Person {
  const { data, viewerId } = useSnapshot()
  return viewerOf(data, viewerId)
}

export function usePeople(): Person[] {
  return useSnapshot().data.people
}

export function useMyList(): { me: Person; wishes: WishItem[] } {
  const { data, viewerId } = useSnapshot()
  return useMemo(() => {
    const me = viewerOf(data, viewerId)
    return { me, wishes: data.wishes.filter((w) => w.ownerId === me.id).sort(byPriority) }
  }, [data, viewerId])
}

export interface ShoppingView {
  person: Person
  wishes: WishItem[]
  gifts: Gift[]
  ideas: Idea[]
}

// Everything about one person, for everyone except that person.
export function useShopping(recipientId: PersonId): ShoppingView | null {
  const { data, viewerId } = useSnapshot()
  return useMemo(() => {
    const person = data.people.find((p) => p.id === recipientId)
    if (!person || person.id === viewerId) return null
    return viewOf(data, person)
  }, [data, viewerId, recipientId])
}

export function useHomes(): Home[] {
  return useSnapshot().data.homes
}

// Everything you're allowed to see about everyone else, for the spreadsheet download.
export function useEveryoneElse(): ShoppingView[] {
  const { data, viewerId } = useSnapshot()
  return useMemo(
    () =>
      data.people
        .filter((p) => p.id !== viewerId)
        .map((person) => viewOf(data, person)),
    [data, viewerId],
  )
}

// Everyone except you, for the home page.
export function useOtherPeople(): Person[] {
  const { data, viewerId } = useSnapshot()
  return useMemo(() => data.people.filter((p) => p.id !== viewerId), [data, viewerId])
}

// ---- Writes ----
// Each write checks it's allowed for the viewer before it goes to the
// database, which checks again.

const now = () => new Date().toISOString()
const newId = () => crypto.randomUUID()
const currentViewer = () => getSnapshot().viewerId
const current = () => getSnapshot().data

export type WishDraft = Pick<WishItem, 'kind' | 'title' | 'link' | 'notes' | 'topPick'>

// Returns the new wishes' ids, so the page can point them out.
export function addWishes(drafts: WishDraft[]): string[] {
  const ownerId = currentViewer()
  let order = Math.max(0, ...current().wishes.filter((w) => w.ownerId === ownerId).map((w) => w.order))
  const added: WishItem[] = drafts.map((draft) => ({ ...draft, id: newId(), ownerId, order: (order += 1), createdAt: now() }))
  backend.put('wishes', added)
  return added.map((w) => w.id)
}

// Only the owner can change their own wishes.
function isOwnWish(id: string) {
  return current().wishes.some((w) => w.id === id && w.ownerId === currentViewer())
}

export function updateWish(id: string, patch: Partial<WishDraft>) {
  if (isOwnWish(id)) backend.patch('wishes', id, patch)
}

export function toggleTopPick(id: string) {
  const wish = current().wishes.find((w) => w.id === id)
  if (wish && isOwnWish(id)) backend.patch('wishes', id, { topPick: !wish.topPick })
}

export function removeWish(id: string) {
  if (isOwnWish(id)) backend.remove('wishes', id)
}

export type GiftDraft = Pick<
  Gift,
  'recipientId' | 'giverId' | 'title' | 'wishItemId' | 'link' | 'notes' | 'place' | 'shipTo'
>

export function addGift(draft: GiftDraft) {
  const viewerId = currentViewer()
  if (draft.recipientId === viewerId) return
  const time = now()
  backend.put('gifts', [{ ...draft, id: newId(), createdAt: time, updatedAt: time, updatedBy: viewerId }])
}

// Gifts can't be read or changed by the person they're for. (You only ever
// have gifts for other people, so being able to see it is enough.)
function canChangeGift(id: string) {
  return current().gifts.some((g) => g.id === id && g.recipientId !== currentViewer())
}

export function updateGift(id: string, patch: Partial<GiftDraft>) {
  if (canChangeGift(id)) backend.patch('gifts', id, { ...patch, updatedAt: now(), updatedBy: currentViewer() })
}

export function removeGift(id: string) {
  if (canChangeGift(id)) backend.remove('gifts', id)
}

export function addIdea(aboutId: PersonId, text: string) {
  const authorId = currentViewer()
  if (aboutId === authorId) return
  backend.put('ideas', [{ id: newId(), aboutId, authorId, text, createdAt: now() }])
}

export function markIdeaGifted(id: string) {
  if (current().ideas.some((i) => i.id === id && i.aboutId !== currentViewer())) backend.patch('ideas', id, { madeIntoGift: true })
}

// Prototype only: the "Viewing as" bar.
export { prototype }
