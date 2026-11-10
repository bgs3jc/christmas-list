// Turns whatever someone pastes into list items: one per line. A line can be
// a link, a link followed by a note ("size 8, green"), or just words.
// Rows copied from a spreadsheet work too: their cells are split by tabs.

import { capitalize, isLink, nameFromLink, nameInLink } from '../../shared/format'

export interface PastedWish {
  title: string
  link?: string
  notes?: string
}

const LINK = /https?:\/\/\S+/i
// Commas, dashes and spaces left over at either end after the link is removed.
const EDGE_PUNCTUATION = /^[\s,;:\-–—]+|[\s,;:\-–—]+$/g

// A spreadsheet's header row is made of words like these; it's skipped.
const HEADER_WORDS = new Set(['item', 'name', 'gift', 'what', 'link', 'url', 'price', 'notes', 'note', 'size', 'color', 'store'])

export function parsePaste(text: string): PastedWish[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines[0]?.includes('\t') && cellsOf(lines[0]).every((cell) => HEADER_WORDS.has(cell.toLowerCase()))) lines.shift()
  return lines.map((line) => (line.includes('\t') ? parseRow(line) : parseLine(line)))
}

const cellsOf = (line: string) =>
  line
    .split('\t')
    .map((cell) => cell.trim())
    .filter(Boolean)

// A spreadsheet row: the first link is the link, the first other cell is the
// name, and every other cell goes in the note.
function parseRow(line: string): PastedWish {
  const cells = cellsOf(line)
  const link = cells.find(isLink)
  const name = cells.find((cell) => !isLink(cell))
  const rest = cells.filter((cell) => cell !== link && cell !== name)
  return {
    title: name ? capitalize(name) : nameFromLink(link!),
    link,
    notes: rest.join(', ') || undefined,
  }
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
