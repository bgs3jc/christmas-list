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

export const statusLabels: Record<GiftStatus | 'open', string> = {
  open: 'Open',
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

// A tracking number becomes a link to the carrier's page, based on its shape.
// Amazon's own numbers can't be tracked publicly, so those go to your orders.
export function trackingLink(number: string): { carrier: string; url: string } {
  const n = number.replace(/\s+/g, '').toUpperCase()
  const q = encodeURIComponent(n)
  if (/^1Z[0-9A-Z]{16}$/.test(n)) return { carrier: 'UPS', url: `https://www.ups.com/track?tracknum=${q}` }
  if (/^TBA\d+$/.test(n)) return { carrier: 'Amazon', url: 'https://www.amazon.com/gp/css/order-history' }
  if (/^9[1-5]\d{18,24}$/.test(n)) return { carrier: 'USPS', url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${q}` }
  if (/^(\d{12}|\d{15})$/.test(n)) return { carrier: 'FedEx', url: `https://www.fedex.com/fedextrack/?trknbr=${q}` }
  return { carrier: '', url: `https://www.google.com/search?q=${q}` }
}
