// Small text helpers used by more than one feature.

import type { GiftStatus, SantasListStatus } from '../data'

// "rei.com" from "https://www.rei.com/product/...".
export function storeFromLink(link?: string): string | undefined {
  if (!link) return undefined
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return undefined
  }
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

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`
}

export const isLink = (text: string) => /^https?:\/\/\S+$/i.test(text.trim())

const MAX_NAME_WORDS = 6

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// Most shops put the product name in the link: ".../rite-in-the-rain-notebook/123".
// Take the longest wordy, hyphenated piece, tidy it up and keep it short.
export function nameFromLink(link: string): string {
  const store = storeFromLink(link) ?? 'a link'
  let path = ''
  try {
    path = decodeURIComponent(new URL(link).pathname)
  } catch {
    return `Something from ${store}`
  }
  const best = path
    .split('/')
    .filter((part) => /[a-z]{3,}/i.test(part) && /[-_+]/.test(part))
    .sort((a, b) => b.length - a.length)[0]
  if (!best) return `Something from ${store}`
  return capitalize(
    best
      .replace(/\.(html?|aspx?|php)$/i, '')
      .replace(/[-_+]+/g, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, MAX_NAME_WORDS)
      .join(' '),
  )
}
