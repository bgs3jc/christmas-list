// Small text helpers used by more than one feature.

import type { GiftStatus, SantasListStatus, WishItem } from '../data'

// "rei.com" from "https://www.rei.com/product/...".
export function storeFromLink(link?: string): string | undefined {
  if (!link) return undefined
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
}

// The grey line under a wish: price, store and notes.
export function wishDetails(wish: WishItem): string {
  return [wish.price, storeFromLink(wish.link), wish.notes].filter(Boolean).join(' · ')
}

export const statusLabels: Record<GiftStatus, string> = {
  planned: 'Planned',
  bought: 'Bought',
  wrapped: 'Wrapped',
}

export const santasListLabels: Record<SantasListStatus, string> = {
  nice: 'Nice',
  fence: 'On the fence',
  naughty: 'Naughty',
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}
