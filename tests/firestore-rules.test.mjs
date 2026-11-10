// Checks firestore.rules against Firebase's local emulator, acting as each
// person. Run with: npm run test:rules
// Uses made-up example.com emails; real ones live only in the database.

import { after, before, beforeEach, describe, test } from 'node:test'
import { readFileSync } from 'node:fs'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'

let env

const family = { brady: 'brady@example.com', april: 'april@example.com', allie: 'allie@example.com', kevin: 'kevin@example.com' }

// Signed in with a verified email.
function as(email, verified = true) {
  return env.authenticatedContext(email, { email, email_verified: verified }).firestore()
}

const gift = (recipientId, giverId) => ({
  recipientId,
  giverId,
  title: 'A gift',
  place: 'tree',
  createdAt: '2026-11-01T00:00:00Z',
  updatedAt: '2026-11-01T00:00:00Z',
  updatedBy: giverId,
})

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-family-christmas',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

after(async () => {
  await env?.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    for (const [personId, email] of Object.entries(family)) {
      await setDoc(doc(db, 'members', email), { personId })
      await setDoc(doc(db, 'people', personId), { name: personId, homeId: personId })
    }
    await setDoc(doc(db, 'homes', 'april'), { name: "April's" })
    await setDoc(doc(db, 'homes', 'allie'), { name: "Allie's" })
    await setDoc(doc(db, 'wishes', 'w-april'), { ownerId: 'april', kind: 'specific', title: 'Slippers', topPick: false, order: 1, createdAt: '2026-11-01T00:00:00Z' })
    await setDoc(doc(db, 'wishes', 'w-brady'), { ownerId: 'brady', kind: 'specific', title: 'Skillet', topPick: false, order: 1, createdAt: '2026-11-01T00:00:00Z' })
    await setDoc(doc(db, 'gifts', 'g-for-april'), { ...gift('april', 'allie'), wishItemId: 'w-april' })
    await setDoc(doc(db, 'gifts', 'g-for-allie'), gift('allie', 'brady'))
    await setDoc(doc(db, 'ideas', 'i-about-april'), { aboutId: 'april', authorId: 'allie', text: 'Lamp flickers', createdAt: '2026-11-01T00:00:00Z' })
    await setDoc(doc(db, 'ideas', 'i-about-kevin'), { aboutId: 'kevin', authorId: 'april', text: 'Game day', createdAt: '2026-11-01T00:00:00Z' })
  })
})

describe('outsiders', () => {
  test('signed out sees nothing', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(getDocs(collection(db, 'people')))
    await assertFails(getDocs(collection(db, 'wishes')))
  })

  test('an email not on the family list sees nothing', async () => {
    const db = as('stranger@example.com')
    await assertFails(getDocs(collection(db, 'people')))
    await assertFails(getDocs(collection(db, 'wishes')))
    await assertFails(getDocs(query(collection(db, 'gifts'), where('recipientId', '!=', 'nobody'))))
    await assertFails(getDoc(doc(db, 'members', family.april)))
  })

  test('an unverified email is not trusted', async () => {
    const db = as(family.brady, false)
    await assertFails(getDocs(collection(db, 'people')))
  })
})

describe('the family list (members)', () => {
  test('you can look yourself up, even with capitals in your email', async () => {
    await assertSucceeds(getDoc(doc(as('April@Example.com'), 'members', family.april)))
    await assertSucceeds(getDocs(collection(as('April@Example.com'), 'people')))
  })

  test("you can't read anyone else's entry or change the list", async () => {
    const db = as(family.april)
    await assertFails(getDoc(doc(db, 'members', family.brady)))
    await assertFails(getDocs(collection(db, 'members')))
    await assertFails(setDoc(doc(db, 'members', 'friend@example.com'), { personId: 'april' }))
    await assertFails(updateDoc(doc(db, 'members', family.april), { personId: 'brady' }))
  })

  test('people and homes are read-only on the site', async () => {
    const db = as(family.brady)
    await assertSucceeds(getDocs(collection(db, 'homes')))
    await assertFails(updateDoc(doc(db, 'people', 'brady'), { santasList: 'nice' }))
    await assertFails(setDoc(doc(db, 'homes', 'new'), { name: 'New' }))
  })
})

describe('gifts and claims stay hidden from the person they are for', () => {
  test('April reads gifts for everyone else', async () => {
    const result = await assertSucceeds(getDocs(query(collection(as(family.april), 'gifts'), where('recipientId', '!=', 'april'))))
    const ids = result.docs.map((d) => d.id)
    if (ids.includes('g-for-april') || !ids.includes('g-for-allie')) throw new Error(`wrong gifts: ${ids}`)
  })

  test("April can't read her own gifts, by query or by name", async () => {
    const db = as(family.april)
    await assertFails(getDocs(collection(db, 'gifts')))
    await assertFails(getDocs(query(collection(db, 'gifts'), where('recipientId', '==', 'april'))))
    await assertFails(getDoc(doc(db, 'gifts', 'g-for-april')))
  })

  test("April can't add, change or remove a gift for herself", async () => {
    const db = as(family.april)
    await assertFails(setDoc(doc(db, 'gifts', 'new'), gift('april', 'april')))
    await assertFails(updateDoc(doc(db, 'gifts', 'g-for-april'), { title: 'Peek', updatedBy: 'april' }))
    await assertFails(deleteDoc(doc(db, 'gifts', 'g-for-april')))
    // ...or move someone else's gift to herself.
    await assertFails(updateDoc(doc(db, 'gifts', 'g-for-allie'), { recipientId: 'april', updatedBy: 'april' }))
  })

  test('April adds, changes and removes gifts for others', async () => {
    const db = as(family.april)
    await assertSucceeds(setDoc(doc(db, 'gifts', 'new'), gift('allie', 'april')))
    await assertSucceeds(updateDoc(doc(db, 'gifts', 'g-for-allie'), { title: 'Better gift', updatedBy: 'april' }))
    await assertSucceeds(deleteDoc(doc(db, 'gifts', 'g-for-allie')))
  })

  test("you can't sign a gift with someone else's name", async () => {
    const db = as(family.april)
    await assertFails(setDoc(doc(db, 'gifts', 'new'), { ...gift('allie', 'april'), updatedBy: 'brady' }))
    await assertFails(updateDoc(doc(db, 'gifts', 'g-for-allie'), { title: 'x', updatedBy: 'brady' }))
  })
})

describe('overheard notes stay hidden from the person they are about', () => {
  test('April reads notes about everyone else, never about herself', async () => {
    const db = as(family.april)
    const result = await assertSucceeds(getDocs(query(collection(db, 'ideas'), where('aboutId', '!=', 'april'))))
    if (result.docs.some((d) => d.id === 'i-about-april')) throw new Error('saw a note about herself')
    await assertFails(getDocs(collection(db, 'ideas')))
    await assertFails(getDoc(doc(db, 'ideas', 'i-about-april')))
  })

  test('notes are written as yourself, about someone else', async () => {
    const db = as(family.april)
    const note = { aboutId: 'brady', authorId: 'april', text: 'Needs socks', createdAt: '2026-11-02T00:00:00Z' }
    await assertSucceeds(setDoc(doc(db, 'ideas', 'new'), note))
    await assertFails(setDoc(doc(db, 'ideas', 'mine'), { ...note, aboutId: 'april' }))
    await assertFails(setDoc(doc(db, 'ideas', 'forged'), { ...note, authorId: 'allie' }))
  })

  test('"Make it a gift" marks a note; it can\'t be moved to someone else', async () => {
    const db = as(family.april)
    await assertSucceeds(updateDoc(doc(db, 'ideas', 'i-about-kevin'), { madeIntoGift: true }))
    await assertFails(updateDoc(doc(db, 'ideas', 'i-about-kevin'), { aboutId: 'april' }))
  })
})

describe('wish lists', () => {
  test('everyone in the family reads every list', async () => {
    await assertSucceeds(getDocs(collection(as(family.kevin), 'wishes')))
  })

  test('you change only your own list', async () => {
    const db = as(family.april)
    await assertSucceeds(setDoc(doc(db, 'wishes', 'new'), { ownerId: 'april', kind: 'maybe', title: 'Candles', topPick: false, order: 2, createdAt: '2026-11-02T00:00:00Z' }))
    await assertSucceeds(updateDoc(doc(db, 'wishes', 'w-april'), { topPick: true }))
    await assertSucceeds(deleteDoc(doc(db, 'wishes', 'w-april')))
    await assertFails(setDoc(doc(db, 'wishes', 'fake'), { ownerId: 'brady', kind: 'maybe', title: 'Coal', topPick: false, order: 9, createdAt: '2026-11-02T00:00:00Z' }))
    await assertFails(updateDoc(doc(db, 'wishes', 'w-brady'), { title: 'Coal' }))
    await assertFails(deleteDoc(doc(db, 'wishes', 'w-brady')))
    await assertFails(updateDoc(doc(db, 'wishes', 'w-april'), { ownerId: 'brady' }))
  })
})

describe('only real people and known fields', () => {
  test('a gift for someone who is not a person is refused (the misspelled-name leak)', async () => {
    const db = as(family.brady)
    await assertFails(setDoc(doc(db, 'gifts', 'typo'), gift('April', 'brady')))
    await assertFails(setDoc(doc(db, 'gifts', 'ghost'), gift('nobody', 'brady')))
    await assertFails(setDoc(doc(db, 'gifts', 'fromghost'), gift('allie', 'nobody')))
  })

  test('a gift from yourself to yourself, or to a made-up house, is refused', async () => {
    const db = as(family.brady)
    await assertFails(setDoc(doc(db, 'gifts', 'self'), gift('allie', 'allie')))
    await assertFails(setDoc(doc(db, 'gifts', 'nohouse'), { ...gift('allie', 'brady'), shipTo: 'mars' }))
    await assertSucceeds(setDoc(doc(db, 'gifts', 'shipped'), { ...gift('allie', 'brady'), shipTo: 'april', link: 'https://example.com', notes: 'Blue' }))
  })

  test('unknown or wrong-kind fields are refused', async () => {
    const db = as(family.brady)
    await assertFails(setDoc(doc(db, 'gifts', 'extra'), { ...gift('allie', 'brady'), secret: 'x' }))
    await assertFails(setDoc(doc(db, 'gifts', 'place'), { ...gift('allie', 'brady'), place: 'roof' }))
    await assertFails(setDoc(doc(db, 'gifts', 'blank'), { ...gift('allie', 'brady'), title: '' }))
    await assertFails(updateDoc(doc(db, 'gifts', 'g-for-allie'), { title: 123, updatedBy: 'brady' }))
    const wish = { ownerId: 'brady', kind: 'specific', title: 'Socks', topPick: false, order: 3, createdAt: '2026-11-02T00:00:00Z' }
    await assertSucceeds(setDoc(doc(db, 'wishes', 'ok'), wish))
    await assertFails(setDoc(doc(db, 'wishes', 'kind'), { ...wish, kind: 'urgent' }))
    await assertFails(setDoc(doc(db, 'wishes', 'star'), { ...wish, topPick: 'yes' }))
    await assertFails(setDoc(doc(db, 'wishes', 'missing'), { ownerId: 'brady', title: 'Socks' }))
    const note = { aboutId: 'allie', authorId: 'brady', text: 'Likes tea', createdAt: '2026-11-02T00:00:00Z' }
    await assertFails(setDoc(doc(db, 'ideas', 'nobody'), { ...note, aboutId: 'Allie' }))
    await assertFails(setDoc(doc(db, 'ideas', 'extra'), { ...note, recipientId: 'allie' }))
  })

  test('clearing a field is allowed (shipping back to none, a note removed)', async () => {
    const db = as(family.brady)
    await assertSucceeds(updateDoc(doc(db, 'gifts', 'g-for-allie'), { shipTo: 'april', updatedBy: 'brady' }))
    await assertSucceeds(updateDoc(doc(db, 'gifts', 'g-for-allie'), { shipTo: deleteField(), updatedBy: 'brady' }))
    await assertSucceeds(updateDoc(doc(db, 'wishes', 'w-brady'), { notes: 'x' }))
    await assertSucceeds(updateDoc(doc(db, 'wishes', 'w-brady'), { notes: deleteField() }))
  })
})
