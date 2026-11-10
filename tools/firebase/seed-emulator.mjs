// Fills Firebase's local emulator with the prototype's made-up sample data, for trying the
// site with real sign-in on your own machine (npm run dev:emulators).
// Never touches the real database: the emulator's "demo-" project is local.
// Sign in on the site with any of the example.com emails below and the
// emulator's family password, "emulator-family-password" (made up; the real
// one is never in the code).

import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = await initializeTestEnvironment({
  projectId: 'demo-family-christmas',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
})

const day = (d) => `2026-${d}T15:00:00.000Z`

const records = {
  members: {
    'brady@example.com': { personId: 'brady' },
    'april@example.com': { personId: 'april' },
    'allie@example.com': { personId: 'allie' },
    'kevin@example.com': { personId: 'kevin' },
  },
  homes: {
    brady: { name: "Brady's" },
    april: { name: "April's" },
    allie: { name: "Allie's" },
  },
  people: {
    brady: { name: 'Brady', homeId: 'brady', santasList: 'naughty' },
    april: { name: 'April', homeId: 'april', santasList: 'nice', globeScene: 'two-cats' },
    allie: { name: 'Allie', homeId: 'allie', santasList: 'nice', globeScene: 'tabby' },
    kevin: { name: 'Kevin', homeId: 'allie', santasList: 'fence', globeScene: 'quarterback' },
  },
  wishes: {
    'w-allie-1': { ownerId: 'allie', kind: 'specific', title: 'Weighted blanket', notes: '15 lb, queen size', topPick: true, order: 1, createdAt: day('10-02') },
    'w-allie-2': { ownerId: 'allie', kind: 'specific', title: 'Gooseneck pour-over kettle', notes: 'Matte black', topPick: false, order: 2, createdAt: day('10-02') },
    'w-allie-3': { ownerId: 'allie', kind: 'maybe', title: 'Houseplants that are hard to kill', notes: 'Low light. Heavy pots.', topPick: false, order: 3, createdAt: day('10-05') },
    'w-allie-4': { ownerId: 'allie', kind: 'specific', title: 'Wool beanie', notes: 'Any color but orange', topPick: false, order: 4, createdAt: day('10-05') },
    'w-allie-5': { ownerId: 'allie', kind: 'specific', title: 'Platform clogs', notes: 'Size 8, the green ones', topPick: false, order: 5, createdAt: day('10-23') },
    'w-allie-6': { ownerId: 'allie', kind: 'specific', title: 'Waterproof field notebooks, 3-pack', notes: 'Any color', topPick: false, order: 6, createdAt: day('10-23') },
    'w-april-1': { ownerId: 'april', kind: 'maybe', title: 'Anything Christmas-y for the house', notes: 'Ornaments, candles, a new tree skirt', topPick: true, order: 1, createdAt: day('10-10') },
    'w-april-2': { ownerId: 'april', kind: 'specific', title: 'Cozy slippers', notes: 'Size 8', topPick: false, order: 2, createdAt: day('10-12') },
    'w-kevin-1': { ownerId: 'kevin', kind: 'specific', title: 'Wireless earbuds', topPick: true, order: 1, createdAt: day('10-08') },
    'w-kevin-2': { ownerId: 'kevin', kind: 'specific', title: 'Zip hoodie', notes: 'Large, navy', topPick: false, order: 2, createdAt: day('10-08') },
    'w-kevin-3': { ownerId: 'kevin', kind: 'maybe', title: 'Anything for game day', notes: 'Large in shirts', topPick: false, order: 3, createdAt: day('10-15') },
    'w-brady-1': { ownerId: 'brady', kind: 'specific', title: 'Mechanical keyboard', notes: 'Tactile switches', topPick: true, order: 1, createdAt: day('10-01') },
    'w-brady-2': { ownerId: 'brady', kind: 'specific', title: 'Cast iron skillet', notes: '12 inch', topPick: false, order: 2, createdAt: day('10-01') },
    'w-brady-3': { ownerId: 'brady', kind: 'specific', title: 'Running socks', notes: 'Size L', topPick: false, order: 3, createdAt: day('10-04') },
  },
  gifts: {
    'g-1': { recipientId: 'allie', giverId: 'brady', title: 'Gooseneck pour-over kettle', wishItemId: 'w-allie-2', shipTo: 'april', place: 'tree', createdAt: day('10-06'), updatedAt: day('10-06'), updatedBy: 'brady' },
    'g-2': { recipientId: 'allie', giverId: 'april', title: 'Wool beanie', wishItemId: 'w-allie-4', place: 'tree', createdAt: day('10-09'), updatedBy: 'brady', updatedAt: day('10-09') },
    'g-3': { recipientId: 'allie', giverId: 'brady', title: 'Snake plant in a ceramic pot', wishItemId: 'w-allie-3', shipTo: 'april', place: 'tree', createdAt: day('10-11'), updatedAt: day('10-11'), updatedBy: 'brady' },
    'g-4': { recipientId: 'allie', giverId: 'kevin', title: 'Heated throw blanket', place: 'tree', createdAt: day('10-14'), updatedAt: day('10-22'), updatedBy: 'kevin' },
    'g-5': { recipientId: 'allie', giverId: 'april', title: 'Lip balm trio', place: 'stocking', createdAt: day('10-16'), updatedAt: day('10-16'), updatedBy: 'april' },
    'g-6': { recipientId: 'april', giverId: 'allie', title: 'Cozy slippers', wishItemId: 'w-april-2', place: 'tree', createdAt: day('10-18'), updatedAt: day('10-18'), updatedBy: 'allie' },
    'g-7': { recipientId: 'kevin', giverId: 'brady', title: 'Zip hoodie', wishItemId: 'w-kevin-2', place: 'tree', createdAt: day('10-20'), updatedAt: day('10-20'), updatedBy: 'brady' },
  },
  ideas: {
    'i-1': { aboutId: 'allie', authorId: 'kevin', text: 'Said her favorite mug finally chipped', createdAt: day('10-19') },
    'i-2': { aboutId: 'allie', authorId: 'brady', text: 'Wants to try the new bakery downtown', createdAt: day('10-03') },
    'i-3': { aboutId: 'april', authorId: 'allie', text: 'Her reading lamp keeps flickering', createdAt: day('10-12') },
  },
}

await env.clearFirestore()
await env.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore()
  for (const [name, docs] of Object.entries(records)) {
    for (const [id, data] of Object.entries(docs)) await setDoc(doc(db, name, id), data)
  }
})
await env.cleanup()

// A password account for each, the way the real ones are made: account first,
// then the members entry (here, both before anyone signs in).
const AUTH = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1'
for (const email of Object.keys(records.members)) {
  const r = await fetch(`${AUTH}/accounts:signUp?key=emulator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'emulator-family-password' }),
  })
  const j = await r.json()
  if (!r.ok && j.error?.message !== 'EMAIL_EXISTS') throw new Error(`Couldn't make ${email}'s account: ${j.error?.message}`)
}
console.log('Emulator filled with sample family data and sign-in accounts.')
