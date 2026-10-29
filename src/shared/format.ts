// Small text helpers used by more than one feature.

import type { SantasListStatus } from '../data'

// Short links that shops' phone apps hand out when you tap Share.
const SHORT_LINK_STORES: Record<string, string> = {
  'a.co': 'amazon.com',
  'amzn.to': 'amazon.com',
  'amzn.com': 'amazon.com',
}

// "rei.com" from "https://www.rei.com/product/...".
export function storeFromLink(link?: string): string | undefined {
  if (!link) return undefined
  try {
    const host = new URL(link).hostname.replace(/^www\./, '')
    return SHORT_LINK_STORES[host] ?? host
  } catch {
    return undefined
  }
}

// A wish either still needs someone to get it, or someone has it covered.
// The words live here so they can change in one place.
export type RowStatus = 'open' | 'covered'

export const statusLabels: Record<RowStatus, string> = {
  open: 'Needs Santa',
  covered: "Santa's got it",
}

// The button that covers a wish.
export const coverLabel = "I'll be Santa"

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
// Short share links ("a.co/d/7xYz") have no name in them: undefined.
export function nameInLink(link: string): string | undefined {
  let path = ''
  try {
    path = decodeURIComponent(new URL(link).pathname)
  } catch {
    return undefined
  }
  const best = path
    .split('/')
    .filter((part) => /[a-z]{3,}/i.test(part) && /[-_+]/.test(part))
    .sort((a, b) => b.length - a.length)[0]
  if (!best) return undefined
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

export function nameFromLink(link: string): string {
  return nameInLink(link) ?? `Something from ${storeFromLink(link) ?? 'a link'}`
}
