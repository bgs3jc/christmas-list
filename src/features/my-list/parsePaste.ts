// Turns whatever someone pastes into list items: one per line. A line can be
// a link, a link followed by a note ("size 8, green"), or just words.

import { storeFromLink } from '../../shared/format'

export interface PastedWish {
  title: string
  link?: string
  notes?: string
}

const LINK = /https?:\/\/\S+/i
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
  return { title: nameFromLink(link), link, notes: rest || undefined }
}

const MAX_NAME_WORDS = 6

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

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
