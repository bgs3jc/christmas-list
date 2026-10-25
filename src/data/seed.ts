// Made-up sample data so the prototype has something to click through.
// It's deliberately generic: real family details belong in the database, not
// in this public code. "Reset sample data" in the prototype bar restores it.
// The Santa's list calls are Brady's to make here (in the database from M4).

import type { AppData, Gift, WishItem } from './types'

const day = (d: string) => `2026-${d}T15:00:00.000Z`

let nextOrder = 0
function wish(item: Omit<WishItem, 'order' | 'topPick'> & { topPick?: boolean }): WishItem {
  nextOrder += 1
  return { topPick: false, order: nextOrder, ...item }
}

function gift(item: Omit<Gift, 'updatedAt' | 'updatedBy' | 'place'> & Partial<Gift>): Gift {
  return { place: 'tree', updatedAt: item.createdAt, updatedBy: item.giverId, ...item }
}

export function sampleData(): AppData {
  nextOrder = 0
  return {
    people: [
      { id: 'brady', name: 'Brady', santasList: 'naughty' },
      { id: 'april', name: 'April', santasList: 'nice' },
      { id: 'allie', name: 'Allie', santasList: 'nice' },
      { id: 'kevin', name: 'Kevin', santasList: 'fence' },
    ],
    wishes: [
      wish({ id: 'w-allie-1', ownerId: 'allie', kind: 'specific', title: 'Weighted blanket', notes: '15 lb, queen size', topPick: true, createdAt: day('10-02') }),
      wish({ id: 'w-allie-2', ownerId: 'allie', kind: 'specific', title: 'Gooseneck pour-over kettle', notes: 'Matte black', createdAt: day('10-02') }),
      wish({ id: 'w-allie-3', ownerId: 'allie', kind: 'maybe', title: 'Houseplants that are hard to kill', notes: 'Low light. Heavy pots.', createdAt: day('10-05') }),
      wish({ id: 'w-allie-4', ownerId: 'allie', kind: 'specific', title: 'Wool beanie', notes: 'Any color but orange', createdAt: day('10-05') }),
      wish({ id: 'w-allie-5', ownerId: 'allie', kind: 'specific', title: 'Platform clogs', notes: 'Size 8, the green ones', createdAt: day('10-23') }),
      wish({ id: 'w-allie-6', ownerId: 'allie', kind: 'specific', title: 'Waterproof field notebooks, 3-pack', notes: 'Any color', createdAt: day('10-23') }),

      wish({ id: 'w-april-1', ownerId: 'april', kind: 'maybe', title: 'Anything Christmas-y for the house', notes: 'Ornaments, candles, a new tree skirt', topPick: true, createdAt: day('10-10') }),
      wish({ id: 'w-april-2', ownerId: 'april', kind: 'specific', title: 'Cozy slippers', notes: 'Size 8', createdAt: day('10-12') }),

      wish({ id: 'w-kevin-1', ownerId: 'kevin', kind: 'specific', title: 'Wireless earbuds', topPick: true, createdAt: day('10-08') }),
      wish({ id: 'w-kevin-2', ownerId: 'kevin', kind: 'specific', title: 'Zip hoodie', notes: 'Large, navy', createdAt: day('10-08') }),
      wish({ id: 'w-kevin-3', ownerId: 'kevin', kind: 'maybe', title: 'Anything for game day', notes: 'Large in shirts', createdAt: day('10-15') }),

      wish({ id: 'w-brady-1', ownerId: 'brady', kind: 'specific', title: 'Mechanical keyboard', notes: 'Tactile switches', topPick: true, createdAt: day('10-01') }),
      wish({ id: 'w-brady-2', ownerId: 'brady', kind: 'specific', title: 'Cast iron skillet', notes: '12 inch', createdAt: day('10-01') }),
      wish({ id: 'w-brady-3', ownerId: 'brady', kind: 'specific', title: 'Running socks', notes: 'Size L', createdAt: day('10-04') }),
    ],
    gifts: [
      gift({ id: 'g-1', recipientId: 'allie', giverId: 'brady', title: 'Gooseneck pour-over kettle', wishItemId: 'w-allie-2', price: '$55', status: 'wrapped', createdAt: day('10-06') }),
      gift({ id: 'g-2', recipientId: 'allie', giverId: 'april', title: 'Wool beanie', wishItemId: 'w-allie-4', status: 'planned', createdAt: day('10-09'), updatedBy: 'brady' }),
      gift({ id: 'g-3', recipientId: 'allie', giverId: 'brady', title: 'Snake plant in a ceramic pot', wishItemId: 'w-allie-3', price: '$34', status: 'bought', createdAt: day('10-11') }),
      gift({ id: 'g-4', recipientId: 'allie', giverId: 'kevin', title: 'Heated throw blanket', price: '$65', status: 'bought', createdAt: day('10-14'), updatedAt: day('10-22') }),
      gift({ id: 'g-5', recipientId: 'allie', giverId: 'april', title: 'Lip balm trio', price: '$14', status: 'bought', place: 'stocking', createdAt: day('10-16') }),
      gift({ id: 'g-6', recipientId: 'april', giverId: 'allie', title: 'Cozy slippers', wishItemId: 'w-april-2', price: '$40', status: 'bought', createdAt: day('10-18') }),
      gift({ id: 'g-7', recipientId: 'kevin', giverId: 'brady', title: 'Zip hoodie', wishItemId: 'w-kevin-2', price: '$60', status: 'planned', createdAt: day('10-20') }),
    ],
    ideas: [
      { id: 'i-1', aboutId: 'allie', authorId: 'kevin', text: 'Said her favorite mug finally chipped', createdAt: day('10-19') },
      { id: 'i-2', aboutId: 'allie', authorId: 'brady', text: 'Wants to try the new bakery downtown', createdAt: day('10-03') },
      { id: 'i-3', aboutId: 'april', authorId: 'allie', text: 'Her reading lamp keeps flickering', createdAt: day('10-12') },
    ],
    lastSeen: { 'brady:allie': day('10-21') },
  }
}
