// Turns everything you can see about everyone else into a CSV file that
// opens in Excel, Numbers or Google Sheets. Nothing about you is in it.

import type { Gift, Home, Person, ShoppingView } from '../../data'

const COLUMNS = ['For', 'Section', 'What', 'Status', "Who's getting it", 'Ships to', 'Notes', 'Link']

// Quote every cell so commas, quotes and line breaks in notes stay put.
const boughtLabel = (gift: Gift) => (gift.bought ? 'Bought' : 'Not bought')

const cell = (value: string | undefined) => `"${(value ?? '').replace(/"/g, '""')}"`

export function toSpreadsheet(views: ShoppingView[], people: Person[], homes: Home[]): string {
  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? ''
  const homeOf = (id?: string) => (id ? (homes.find((h) => h.id === id)?.name ?? '') : '')
  const rows: (string | undefined)[][] = []

  for (const { person, wishes, gifts, ideas } of views) {
    const giftRow = (section: string, gift: Gift) => [
      person.name, section, gift.title, boughtLabel(gift), nameOf(gift.giverId), homeOf(gift.shipTo), gift.notes, gift.link,
    ]

    for (const wish of wishes) {
      const under = gifts.filter((g) => g.wishItemId === wish.id)
      const section = wish.kind === 'maybe' ? 'List (idea)' : 'List'
      // A specific wish that someone's getting is one row: the wish and its gift together.
      const claimed = wish.kind === 'specific' ? under[0] : undefined
      if (claimed) {
        const notes = [wish.notes, claimed.notes].filter(Boolean).join(' / ')
        rows.push([person.name, section, wish.title, boughtLabel(claimed), nameOf(claimed.giverId), homeOf(claimed.shipTo), notes, wish.link ?? claimed.link])
        continue
      }
      rows.push([person.name, section, wish.title, under.length ? '' : 'Open', '', '', wish.notes, wish.link])
      for (const gift of under) rows.push(giftRow(`  for "${wish.title}"`, gift))
    }

    const wishIds = new Set(wishes.map((w) => w.id))
    for (const gift of gifts.filter((g) => !g.wishItemId || !wishIds.has(g.wishItemId))) {
      rows.push(giftRow(gift.place === 'stocking' ? 'Stocking' : 'Surprise', gift))
    }
    for (const idea of ideas) {
      rows.push([person.name, 'Overheard', idea.text, idea.madeIntoGift ? 'Now a gift' : '', '', '', `Heard by ${nameOf(idea.authorId)}`, ''])
    }
  }

  // The byte-order mark tells Excel the file is UTF-8, so names and dashes come through.
  return '﻿' + [COLUMNS, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}
