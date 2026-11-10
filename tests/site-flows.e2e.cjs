// Clicks through the site as Allie, then Kevin (and Brady and April for
// Santa's sack), against Firebase's local
// emulator: I'll be Santa, shipping (and clearing it), Not getting it, a
// surprise gift, Overheard and Make it a gift, gold star, clearing a note,
// the spreadsheet, and that Kevin sees none of what's about him.
//
// Run (Claude's machine; Playwright comes preinstalled there):
//   npm run dev:emulators          (in the background, wait for Vite's address)
//   node tests/site-flows.e2e.cjs
// It changes the emulator's sample data; restart dev:emulators to reset it.

const { chromium } = require('playwright')
const BASE = 'http://localhost:5173/christmas-list/'
const OOB = 'http://127.0.0.1:9099/emulator/v1/projects/demo-family-christmas/oobCodes'
const DB = 'http://127.0.0.1:8080/v1/projects/demo-family-christmas/databases/(default)/documents'
let failures = 0
const check = (label, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); if (!ok) failures++ }

async function docs(name) {
  const r = await fetch(`${DB}/${name}?pageSize=100`, { headers: { Authorization: 'Bearer owner' } })
  const j = await r.json()
  return (j.documents ?? []).map((d) => ({ id: d.name.split('/').pop(), fields: d.fields }))
}

// Writes a record straight into the emulator, as the owner (no rules), like
// two people claiming the same wish at the same moment.
async function put(name, id, record) {
  const fields = Object.fromEntries(Object.entries(record).map(([k, v]) => [k, typeof v === 'boolean' ? { booleanValue: v } : { stringValue: v }]))
  const r = await fetch(`${DB}/${name}?documentId=${id}`, { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) })
  if (!r.ok) throw new Error(`put ${name}/${id}: ${r.status}`)
}

async function signIn(browser, email) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('dialog', (d) => d.accept())
  await page.goto(BASE)
  await page.getByLabel('Your email').fill(email)
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
  await page.getByText('Check your email').waitFor()
  const { oobCodes } = await (await fetch(OOB)).json()
  const link = new URL(oobCodes.filter((c) => c.email === email).pop().oobLink)
  const target = new URL(link.searchParams.get('continueUrl'))
  for (const [k, v] of link.searchParams) if (k !== 'continueUrl') target.searchParams.set(k, v)
  await page.goto(target.toString())
  await page.getByText('Who are you shopping for?').waitFor({ timeout: 15000 })
  return { page, errors }
}

const row = (page, text) => page.getByRole('listitem').filter({ hasText: text })
const settle = (page) => page.waitForTimeout(700)

;(async () => {
  const browser = await chromium.launch()
  const { page: a, errors } = await signIn(browser, 'allie@example.com')

  // 1. I'll be Santa on Kevin's earbuds.
  await a.goto(BASE + '#/shop/kevin')
  await row(a, 'Wireless earbuds').getByRole('button', { name: "I'll be Santa" }).click()
  await row(a, 'Wireless earbuds').getByText("Santa's got it").waitFor()
  await settle(a)
  let g = (await docs('gifts')).find((d) => d.fields.title.stringValue === 'Wireless earbuds')
  check("I'll be Santa saves a gift for Kevin, given by Allie", g && g.fields.recipientId.stringValue === 'kevin' && g.fields.giverId.stringValue === 'allie')

  // 2. Ship it to April's.
  await row(a, 'Wireless earbuds').getByRole('button', { name: /Change/ }).click()
  await a.getByRole('dialog').getByRole('button', { name: "To April's" }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await row(a, 'Wireless earbuds').getByText(/to April's/).waitFor()
  await settle(a)
  g = (await docs('gifts')).find((d) => d.id === g.id)
  check("Shipping to April's is saved", g.fields.shipTo?.stringValue === 'april')

  // 3. Back to not shipping: the field must be cleared, not left behind.
  await row(a, 'Wireless earbuds').getByRole('button', { name: /Change/ }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Not shipping' }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await settle(a)
  g = (await docs('gifts')).find((d) => d.id === g.id)
  check('"Not shipping" clears the saved shipping', g && !('shipTo' in g.fields))
  check('...and the row no longer says "to April\'s"', !(await row(a, 'Wireless earbuds').innerText()).includes("to April's"))

  // 3b. A gift from the list can go in the stocking.
  await row(a, 'Wireless earbuds').getByRole('button', { name: /Change/ }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Stocking' }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await row(a, 'Wireless earbuds').getByText(/stocking/).waitFor()
  await settle(a)
  g = (await docs('gifts')).find((d) => d.id === g.id)
  check('A list gift can go in the stocking', g.fields.place.stringValue === 'stocking')
  check('...and the row says "stocking"', (await row(a, 'Wireless earbuds').innerText()).includes('stocking'))

  // 4. Not getting it after all.
  await row(a, 'Wireless earbuds').getByRole('button', { name: /Change/ }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Not getting it' }).click()
  await row(a, 'Wireless earbuds').getByText('Needs Santa').waitFor()
  await settle(a)
  check('"Not getting it" deletes the gift', !(await docs('gifts')).some((d) => d.id === g.id))

  // 5. A surprise gift.
  await a.getByRole('button', { name: 'Add a gift' }).last().click()
  await a.getByRole('dialog').getByLabel('Link, or what it is').fill('Wool socks')
  await a.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await row(a, 'Wool socks').waitFor()
  await settle(a)
  check('A surprise gift is saved', (await docs('gifts')).some((d) => d.fields.title.stringValue === 'Wool socks'))

  // 6. Overheard, then Make it a gift.
  await a.getByLabel('Add something you heard').fill('Wants a new grill brush')
  await a.getByLabel('Add something you heard').press('Enter')
  await row(a, 'Wants a new grill brush').waitFor()
  await row(a, 'Wants a new grill brush').getByRole('button', { name: 'Make it a gift' }).click()
  await a.getByRole('dialog').getByLabel('Link, or what it is').fill('Grill brush')
  await a.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await row(a, 'Grill brush').first().waitFor()
  await settle(a)
  const idea = (await docs('ideas')).find((d) => d.fields.text.stringValue === 'Wants a new grill brush')
  check('Overheard note saved, written by Allie about Kevin', idea && idea.fields.authorId.stringValue === 'allie' && idea.fields.aboutId.stringValue === 'kevin')
  check('Make it a gift marks the note and adds the gift', idea.fields.madeIntoGift?.booleanValue === true && (await docs('gifts')).some((d) => d.fields.title.stringValue === 'Grill brush'))
  check('The note leaves Overheard', (await a.getByText('Wants a new grill brush').count()) === 0 || !(await a.locator('section', { hasText: 'Overheard' }).innerText()).includes('Wants a new grill brush'))

  // 7. Own list: gold star off, and clearing a note.
  await a.goto(BASE + '#/my-list')
  await a.getByRole('button', { name: 'Gold star: Weighted blanket' }).click()
  await a.getByRole('button', { name: 'Change Weighted blanket' }).click()
  await a.getByRole('dialog').getByLabel('Size, color, anything Santa should know').fill('')
  await a.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await settle(a)
  const w = (await docs('wishes')).find((d) => d.id === 'w-allie-1')
  check('Gold star toggles off', w.fields.topPick.booleanValue === false)
  check('Clearing a note removes it', !('notes' in w.fields))

  // 8. Spreadsheet download works with the real database.
  await a.goto(BASE)
  const [dl] = await Promise.all([a.waitForEvent('download'), a.getByText(/spreadsheet/i).click()])
  const path = await dl.path()
  const csv = require('fs').readFileSync(path, 'utf8')
  check('Spreadsheet download includes the new gifts', csv.includes('Wool socks') && csv.includes('Grill brush'))
  check('Allie\'s spreadsheet has nothing about her own gifts (no "Lip balm")', !csv.includes('Lip balm'))

  // 9. Two Santas on one wish: Brady and April both got Allie's weighted blanket.
  const at = '2026-11-01T15:00:00.000Z'
  for (const [id, giverId] of [['g-two-1', 'brady'], ['g-two-2', 'april']]) {
    await put('gifts', id, { recipientId: 'allie', giverId, title: 'Weighted blanket', wishItemId: 'w-allie-1', place: 'tree', createdAt: at, updatedAt: at, updatedBy: giverId })
  }

  // 10. Kevin signs in: none of it shows anywhere.
  const { page: k, errors: kErrors } = await signIn(browser, 'kevin@example.com')
  let seen = await k.locator('body').innerText()
  await k.goto(BASE + '#/my-list'); await k.getByText('Wireless earbuds').waitFor()
  seen += await k.locator('body').innerText()
  await k.goto(BASE + '#/shop/kevin'); await settle(k)
  seen += await k.locator('body').innerText()
  const [kdl] = await Promise.all([k.waitForEvent('download'), (async () => { await k.goto(BASE); await k.getByText(/spreadsheet/i).click() })()])
  seen += require('fs').readFileSync(await kdl.path(), 'utf8')
  check('Kevin sees no trace of his gifts or the note about him', !/Wool socks|Grill brush|grill brush/.test(seen))
  check("Kevin's own list shows no claim", !(await (async () => { await k.goto(BASE + '#/my-list'); await k.getByText('Wireless earbuds').waitFor(); return k.locator('main').innerText() })()).includes("Santa's got it"))

  // Back to 9: Kevin sees both Santas on Allie's blanket; Allie sees nothing new.
  await k.goto(BASE + '#/shop/allie')
  const blanket = await row(k, 'Weighted blanket').first().innerText()
  check('Two Santas on one wish: both names show', blanket.includes('Brady') && blanket.includes('April'))
  check('...with the note to sort it out', blanket.includes('Two Santas on this one. One of you can tap Change, then Not getting it.'))
  await a.goto(BASE + '#/my-list'); await a.getByText('Weighted blanket').waitFor(); await settle(a)
  const ownBlanket = await row(a, 'Weighted blanket').first().innerText()
  check("...and Allie's own list shows nothing new", !/Brady|April|Santa/.test(ownBlanket))

  // Kevin changes the note on April's lip balm for Allie: anyone can change any gift.
  await row(k, 'Lip balm trio').getByRole('button', { name: /Change/ }).click()
  check("Someone else's gift says Take it off, not Not getting it", (await k.getByRole('dialog').getByRole('button', { name: 'Take it off' }).count()) === 1)
  await k.getByRole('dialog').getByLabel('Notes for the family').fill('Got the vanilla one')
  await k.getByRole('dialog').getByRole('button', { name: 'Save' }).click()
  await row(k, 'Lip balm trio').getByText(/Got the vanilla one/).waitFor()
  await settle(k)
  const balm = (await docs('gifts')).find((d) => d.id === 'g-5')
  check("Kevin's note on April's gift is saved, marked as changed by Kevin", balm.fields.notes?.stringValue === 'Got the vanilla one' && balm.fields.updatedBy.stringValue === 'kevin' && balm.fields.giverId.stringValue === 'april')

  // 11. Santa's sack. Brady: the kettle is under "For Allie", shipping to April's.
  const { page: b, errors: bErrors } = await signIn(browser, 'brady@example.com')
  await b.goto(BASE + '#/sack'); await b.getByRole('heading', { name: 'For Allie' }).waitFor(); await settle(b)
  const forAllie = b.locator('section', { has: b.getByRole('heading', { name: 'For Allie' }) })
  const kettle = await row(forAllie, 'Gooseneck pour-over kettle').innerText()
  check("Sack: Brady's kettle is under For Allie, to April's, with \"Matte black\"", kettle.includes("to April's") && kettle.includes('Matte black'))
  check('Sack: nothing ships to Brady, so no "Landing" section', (await b.getByRole('heading', { name: /Landing/ }).count()) === 0)

  // April: the kettle is landing at her place.
  const { page: ap, errors: apErrors } = await signIn(browser, 'april@example.com')
  await ap.goto(BASE + '#/sack'); await ap.getByRole('heading', { name: 'Landing at your place' }).waitFor()
  const landing = ap.locator('section', { has: ap.getByRole('heading', { name: 'Landing at your place' }) })
  check('Sack: April sees the kettle landing, "From Brady, for Allie"', (await row(landing, 'Gooseneck pour-over kettle').innerText()).includes('From Brady, for Allie'))

  // Kevin: no trace of gifts for him.
  await k.goto(BASE + '#/sack'); await k.getByRole('heading', { name: 'For Allie' }).waitFor(); await settle(k)
  check("Sack: Kevin's page has no trace of gifts for Kevin", !/Zip hoodie|Wool socks|Grill brush|For Kevin/.test(await k.locator('body').innerText()))

  // Allie takes the kettle off her list: Brady's sack says so.
  await a.goto(BASE + '#/my-list')
  await a.getByRole('button', { name: 'Change Gooseneck pour-over kettle' }).click()
  await a.getByRole('dialog').getByRole('button', { name: 'Take off my list' }).click()
  await settle(a)
  await b.getByText("No longer on Allie's list").waitFor({ timeout: 5000 }).catch(() => {})
  check("Sack: a wish taken off the list shows \"No longer on Allie's list\"", (await row(forAllie, 'Gooseneck pour-over kettle').innerText()).includes("No longer on Allie's list"))
  errors.push(...bErrors, ...apErrors)

  check('No errors in any browser', errors.length === 0 && kErrors.length === 0)
  if (errors.length || kErrors.length) console.log(errors, kErrors)
  await browser.close()
  console.log(failures ? `${failures} FAILED` : 'ALL PASSED')
  process.exit(failures ? 1 : 0)
})().catch((e) => { console.error('CRASHED', e.message); process.exit(1) })
