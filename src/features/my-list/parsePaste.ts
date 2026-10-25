// Turns whatever someone pastes into list items: one per line. A line can be
// a link, a link followed by a note ("size 8, green"), or just words.

import { storeFromLink } from '../../shared/format'

export interface PastedWish {
  title: string
  link?: string
  notes?: string
  price?: string
}

const LINK = /https?:\/\/\S+/i
const PRICE = /\$\s?\d[\d,]*(\.\d{2})?/
// Commas, dashes and spaces left over at either end after the link is removed.
const EDGE_PUNCTUATION = /^[\s,;:\-–—]+|[\s,;:\-–—]+$/g

export function parsePaste(text: string): PastedWish[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseLine)
}

function parseLine(line: string): PastedWish {
  const link = line.match(LINK)?.[0]
  const rest = (link ? line.replace(link, '') : line).replace(EDGE_PUNCTUATION, '')
  if (!link) return { title: capitalize(rest) }
  const price = rest.match(PRICE)?.[0]
  const notes = (price ? rest.replace(price, '') : rest).replace(EDGE_PUNCTUATION, '')
  return { title: nameFromLink(link), link, notes: notes || undefined, price }
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// Most shops put the product name in the link: ".../rite-in-the-rain-notebook/123".
// Take the longest wordy, hyphenated piece and tidy it up.
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
      .trim(),
  )
}
