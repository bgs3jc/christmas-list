// The data layer. Every read and write in the app goes through this file;
// components never touch storage (or, from M4, Firebase) directly.
//
// Reads are shaped around who is looking. You only ever get your own list
// without claims, and you never get gifts or ideas about yourself. M5's
// Firestore rules enforce the same thing on the server.

import { useMemo, useSyncExternalStore } from 'react'
import { commit, getSnapshot, resetData, setViewerId, subscribe } from './store'
import type { AppData, Gift, GiftStatus, Idea, Person, PersonId, SantasListStatus, WishItem } from './types'

export type * from './types'

function useSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

function viewerOf(data: AppData, viewerId: PersonId): Person {
  return data.people.find((p) => p.id === viewerId) ?? data.people[0]
}

const byOrder = (a: WishItem, b: WishItem) => a.order - b.order

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
    return { me, wishes: data.wishes.filter((w) => w.ownerId === me.id).sort(byOrder) }
  }, [data, viewerId])
}

export interface ShoppingView {
  person: Person
  wishes: WishItem[]
  gifts: Gift[]
  ideas: Idea[]
  lastSeen?: string
}

// Everything about one person, for everyone except that person.
export function useShopping(recipientId: PersonId): ShoppingView | null {
  const { data, viewerId } = useSnapshot()
  return useMemo(() => {
    const person = data.people.find((p) => p.id === recipientId)
    if (!person || person.id === viewerId) return null
    return {
      person,
      wishes: data.wishes.filter((w) => w.ownerId === recipientId).sort(byOrder),
      gifts: data.gifts.filter((g) => g.recipientId === recipientId),
      ideas: data.ideas.filter((i) => i.aboutId === recipientId),
      lastSeen: data.lastSeen[`${viewerId}:${recipientId}`],
    }
  }, [data, viewerId, recipientId])
}

export interface PersonSummary {
  person: Person
  openCount: number
  giftStatuses: GiftStatus[]
}

// One line per other person, for the home page.
export function useHomeSummary(): PersonSummary[] {
  const { data, viewerId } = useSnapshot()
  return useMemo(
    () =>
      data.people
        .filter((p) => p.id !== viewerId)
        .map((person) => {
          const gifts = data.gifts.filter((g) => g.recipientId === person.id)
          const claimed = new Set(gifts.map((g) => g.wishItemId))
          const openCount = data.wishes.filter(
            (w) => w.ownerId === person.id && w.kind === 'specific' && !claimed.has(w.id),
          ).length
          return { person, openCount, giftStatuses: gifts.map((g) => g.status) }
        }),
    [data, viewerId],
  )
}

// ---- Writes ----

const now = () => new Date().toISOString()
const newId = () => crypto.randomUUID()
const currentViewer = () => getSnapshot().viewerId

export type WishDraft = Pick<WishItem, 'kind' | 'title' | 'link' | 'price' | 'notes' | 'topPick'>

export function addWishes(drafts: WishDraft[]) {
  const ownerId = currentViewer()
  commit((data) => {
    let order = Math.max(0, ...data.wishes.filter((w) => w.ownerId === ownerId).map((w) => w.order))
    const added = drafts.map((draft) => ({ ...draft, id: newId(), ownerId, order: (order += 1), createdAt: now() }))
    return { ...data, wishes: [...data.wishes, ...added] }
  })
}

// Only the owner can change their own wishes.
function changeOwnWish(id: string, change: (w: WishItem) => WishItem) {
  const ownerId = currentViewer()
  commit((data) => ({
    ...data,
    wishes: data.wishes.map((w) => (w.id === id && w.ownerId === ownerId ? change(w) : w)),
  }))
}

export function updateWish(id: string, patch: Partial<WishDraft>) {
  changeOwnWish(id, (w) => ({ ...w, ...patch }))
}

export function toggleTopPick(id: string) {
  changeOwnWish(id, (w) => ({ ...w, topPick: !w.topPick }))
}

export function removeWish(id: string) {
  const ownerId = currentViewer()
  commit((data) => ({ ...data, wishes: data.wishes.filter((w) => !(w.id === id && w.ownerId === ownerId)) }))
}

// Swap a wish with its neighbor above (-1) or below (+1).
export function moveWish(id: string, direction: -1 | 1) {
  const ownerId = currentViewer()
  commit((data) => {
    const mine = data.wishes.filter((w) => w.ownerId === ownerId).sort(byOrder)
    const index = mine.findIndex((w) => w.id === id)
    const other = mine[index + direction]
    if (index < 0 || !other) return data
    const current = mine[index]
    return {
      ...data,
      wishes: data.wishes.map((w) =>
        w.id === current.id ? { ...w, order: other.order } : w.id === other.id ? { ...w, order: current.order } : w,
      ),
    }
  })
}

export type GiftDraft = Pick<Gift, 'recipientId' | 'giverId' | 'title' | 'wishItemId' | 'price' | 'notes' | 'status' | 'place'>

export function addGift(draft: GiftDraft) {
  const viewerId = currentViewer()
  if (draft.recipientId === viewerId) return
  const time = now()
  commit((data) => ({
    ...data,
    gifts: [...data.gifts, { ...draft, id: newId(), createdAt: time, updatedAt: time, updatedBy: viewerId }],
  }))
}

// Gifts can't be read or changed by the person they're for.
function changeGifts(change: (g: Gift) => Gift | null, id: string) {
  const viewerId = currentViewer()
  commit((data) => ({
    ...data,
    gifts: data.gifts.flatMap((g) => {
      if (g.id !== id || g.recipientId === viewerId) return [g]
      const next = change(g)
      return next ? [next] : []
    }),
  }))
}

export function updateGift(id: string, patch: Partial<GiftDraft>) {
  changeGifts((g) => ({ ...g, ...patch, updatedAt: now(), updatedBy: currentViewer() }), id)
}

export function removeGift(id: string) {
  changeGifts(() => null, id)
}

export function addIdea(aboutId: PersonId, text: string) {
  const authorId = currentViewer()
  if (aboutId === authorId) return
  commit((data) => ({ ...data, ideas: [{ id: newId(), aboutId, authorId, text, createdAt: now() }, ...data.ideas] }))
}

export function markIdeaGifted(id: string) {
  const viewerId = currentViewer()
  commit((data) => ({
    ...data,
    ideas: data.ideas.map((i) => (i.id === id && i.aboutId !== viewerId ? { ...i, madeIntoGift: true } : i)),
  }))
}

export function setSantasList(personId: PersonId, status: SantasListStatus) {
  const setBy = currentViewer()
  if (personId === setBy) return
  commit((data) => ({
    ...data,
    people: data.people.map((p) => (p.id === personId ? { ...p, santasList: { status, setBy } } : p)),
  }))
}

export function markSeen(recipientId: PersonId) {
  const viewerId = currentViewer()
  commit((data) => ({ ...data, lastSeen: { ...data.lastSeen, [`${viewerId}:${recipientId}`]: now() } }))
}

// Prototype only.
export const viewAs = setViewerId
export const resetSampleData = resetData
