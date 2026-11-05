// Fills Firebase's local emulator with made-up family data, for trying the
// site with real sign-in on your own machine (npm run dev:emulators).
// Never touches the real database: the emulator's "demo-" project is local.
// Sign in on the site with any of the example.com emails below using
// "Email me a sign-in link"; the emulator prints the link in its log.

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
    'w-april-1': { ownerId: 'april', kind: 'maybe', title: 'Anything Christmas-y for the house', topPick: true, order: 1, createdAt: day('10-10') },
    'w-april-2': { ownerId: 'april', kind: 'specific', title: 'Cozy slippers', notes: 'Size 8', topPick: false, order: 2, createdAt: day('10-12') },
    'w-kevin-1': { ownerId: 'kevin', kind: 'specific', title: 'Wireless earbuds', topPick: true, order: 1, createdAt: day('10-08') },
    'w-brady-1': { ownerId: 'brady', kind: 'specific', title: 'Cast iron skillet', notes: '12 inch', topPick: false, order: 1, createdAt: day('10-01') },
  },
  gifts: {
    'g-1': { recipientId: 'allie', giverId: 'brady', title: 'Gooseneck pour-over kettle', wishItemId: 'w-allie-2', place: 'tree', shipTo: 'april', createdAt: day('10-06'), updatedAt: day('10-06'), updatedBy: 'brady' },
    'g-2': { recipientId: 'april', giverId: 'allie', title: 'Cozy slippers', wishItemId: 'w-april-2', place: 'tree', createdAt: day('10-18'), updatedAt: day('10-18'), updatedBy: 'allie' },
    'g-3': { recipientId: 'allie', giverId: 'april', title: 'Lip balm trio', place: 'stocking', createdAt: day('10-16'), updatedAt: day('10-16'), updatedBy: 'april' },
  },
  ideas: {
    'i-1': { aboutId: 'april', authorId: 'allie', text: 'Her reading lamp keeps flickering', createdAt: day('10-12') },
    'i-2': { aboutId: 'allie', authorId: 'kevin', text: 'Said her favorite mug finally chipped', createdAt: day('10-19') },
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
console.log('Emulator filled with sample family data.')
