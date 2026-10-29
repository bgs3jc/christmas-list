// Turns whatever someone pastes into list items: one per line. A line can be
// a link, a link followed by a note ("size 8, green"), or just words.

import { capitalize, nameFromLink, nameInLink } from '../../shared/format'

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
  // Shops' Share buttons often send the product name with a short link that
  // has no name in it. Then the words are the name, not a note.
  if (rest && !nameInLink(link)) return { title: capitalize(rest), link }
  return { title: nameFromLink(link), link, notes: rest || undefined }
}
