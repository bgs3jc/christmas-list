// The whole site, as each person, with temporary test accounts: sign-in, My
// list, every shopping page, Santa's sack, the spreadsheet, every gift flow,
// and that nobody sees anything about themselves, on the page or by asking
// the database directly with their own sign-in. Then it cleans up after
// itself and checks the database matches how it started.
//
// Three places to run it:
//   Local emulator (sample data):  npm run dev:emulators   (in the background)
//                                   node tests/live-site.e2e.cjs
//   The real site, as the family:  TARGET=live-family FAMILY_PASSWORD=… \
//                                   FAMILY_EMAILS='april=…,allie=…,kevin=…' node tests/live-site.e2e.cjs
//     Signs in as April, Allie and Kevin with the family password; no admin
//     access, no test accounts. Brady (Google) is only shopped for. See live/family.cjs.
//   The real site, as the owner:   gcloud auth login      (as the project owner)
//                                   TARGET=live node tests/live-site.e2e.cjs
// If a run is cut off, `node tests/live-site.e2e.cjs cleanup` (with the same
// TARGET and settings) removes what it left behind.
//
// Safe on the real database: every record it makes starts with "TEST M5",
// and cleanup only deletes records that weren't there before AND carry that
// mark, plus (owner runs) the four m5-test-…@example.com members entries and accounts.
// Anything about you that it reads is never printed: failures say "a real
// record", not what it is. Snapshots and screenshots go to a temp folder
// ($SHOTS), never the repo, because they hold the family's lists.

const { chromium } = require('playwright')
const fs = require('fs')
const os = require('os')
const path = require('path')
const A = require(/-family$/.test(process.env.TARGET ?? '') ? './live/family.cjs' : './live/admin.cjs')

const OUT = process.env.SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), 'family-list-e2e-'))
fs.mkdirSync(OUT, { recursive: true })
const NAMES = { brady: 'Brady', april: 'April', allie: 'Allie', kevin: 'Kevin' }
const T = (text) => `${A.MARK} ${text}`
// Everyone, and who the test signs in as (all four, or April, Allie and Kevin).
const ALL = Object.keys(NAMES)
const PEOPLE = A.PEOPLE
// Who plays which part. Brady's parts go to Kevin and April when Brady can't sign in.
// shipper: a surprise for shipFor, shipped to April's, then claims Allie's wish
//   and is asked about shipping. secondSanta: claims Allie's wish too.
// ideaOf: whose list idea April puts a stocking gift under.
const R = A.FAMILY
  ? { shipper: 'kevin', shipFor: 'allie', secondSanta: 'april', ideaOf: 'kevin' }
  : { shipper: 'brady', shipFor: 'kevin', secondSanta: 'kevin', ideaOf: 'brady' }
const SHIPPED = T(`surprise for ${NAMES[R.shipFor]} from ${NAMES[R.shipper]}`)
const IDEA_GIFT = T(`gift for ${NAMES[R.ideaOf]}'s idea from April`)

// ---- Reporting ----

let failures = 0
let passes = 0
const failed = []
async function check(label, ok, page, detail = '') {
  if (ok) { passes++; console.log(`PASS  ${label}`); return true }
  failures++
  failed.push(label)
  console.log(`FAIL  ${label}${detail ? `  (${detail})` : ''}`)
  // Never a picture of a typed email or password, or a page showing one.
  if (page) await page.evaluate(() => document.querySelectorAll('input[type=email], input[name=password]').forEach((i) => (i.value = ''))).catch(() => {})
  if (page && A.secretIn(await page.locator('body').innerText().catch(() => ''))) page = null
  if (page) {
    const file = path.join(OUT, `FAIL-${String(failures).padStart(2, '0')}-${label.replace(/[^\w]+/g, '-').slice(0, 60)}.png`)
    await page.screenshot({ path: file, fullPage: true }).catch(() => {})
    console.log(`      screenshot: ${file}`)
  }
  return false
}

// A step that crashes counts as a failure, and the run carries on.
async function step(name, page, fn) {
  console.log(`\n-- ${name}`)
  try {
    await fn()
  } catch (error) {
    await check(`${name}: finished without getting stuck`, false, page, String(error.message ?? error).split('\n')[0].slice(0, 200))
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function eventually(fn, ms = 10000) {
  const end = Date.now() + ms
  for (;;) {
    const value = await fn().catch(() => undefined)
    if (value || Date.now() > end) return value
    await wait(400)
  }
}

// ---- The database, as the owner ----

const marked = (name, r) => String((name === 'ideas' ? r.data.text : r.data.title) ?? '').startsWith(A.MARK) || r.id.startsWith('m5-test')
const testMember = (r) => r.id.startsWith('m5-test-') && r.id.endsWith('@example.com')

async function findGift(title, extra = () => true) {
  return eventually(async () => (await A.list('gifts')).find((g) => g.data.title === title && extra(g)))
}

// ---- Signing in: email and the family password ----

async function signIn(browser, personId) {
  const email = A.emailOf(personId)
  const phone = personId === 'april'
  // April: an iPhone width with her text size turned up.
  const ctx = await browser.newContext({
    ...(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 900 } }),
    acceptDownloads: true,
  })
  const page = await ctx.newPage()
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text()))
  page.on('dialog', (d) => d.accept())
  if (phone) await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = '120%')))
  page.person = personId

  await step(`${NAMES[personId]} signs in with email and the family password`, page, async () => {
    await page.goto(A.SITE)
    await page.getByLabel('Your email').fill(email)
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true })
    if (personId === 'april') {
      // One wrong try first: says so, without saying which part is wrong.
      await page.getByLabel('Family password').fill('not-the-family-password')
      await signInButton.click()
      const said = await page.getByRole('alert').filter({ hasText: "That email and family password don't match" }).waitFor({ timeout: 15000 }).then(() => true, () => false)
      await check('April: a wrong password says the email and password don\'t match, and nobody is signed in', said && (await page.getByText('Who are you shopping for?').count()) === 0, page)
      // Show password shows what she typed.
      await page.getByLabel('Show password').check()
      await check('April: "Show password" shows it', (await page.getByLabel('Family password').getAttribute('type')) === 'text', page)
    }
    await page.getByLabel('Family password').fill(A.passwordOf(personId))
    await signInButton.click()
    const ok = await page.getByText('Who are you shopping for?').waitFor({ timeout: 20000 }).then(() => true, () => false)
    await check(`${NAMES[personId]}: signed in, Home shows`, ok, page)
    // Typed once per device: still signed in after closing and reopening the site.
    const again = await ctx.newPage()
    await again.goto(A.SITE)
    const kept = await again.getByText('Who are you shopping for?').waitFor({ timeout: 20000 }).then(() => true, () => false)
    await again.close()
    await check(`${NAMES[personId]}: still signed in when the site is opened again`, kept, page)
  })
  return page
}

const row = (scope, text) => scope.getByRole('listitem').filter({ hasText: text })
const dialog = (page) => page.getByRole('dialog')
const settle = (page) => page.waitForTimeout(A.LIVE ? 1500 : 700)

async function go(page, hash, ready) {
  await page.goto(A.SITE + hash)
  if (ready) await page.getByRole('heading', { name: ready }).first().waitFor({ timeout: 15000 })
  await settle(page)
}

async function noSideScroll(page, where) {
  if (page.person !== 'april') return
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  await check(`April's phone: ${where} doesn't run off the side`, wide <= 1, page, `${wide}px too wide`)
}

async function spreadsheet(page) {
  await go(page, '', 'Who are you shopping for?')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByText('Download everything as a spreadsheet').click()])
  return fs.readFileSync(await download.path(), 'utf8')
}

// ---- Asking the database directly, as a person ----

async function asPerson(token, method, url, body) {
  return A.call(url, { method, body, auth: token })
}
const refused = (r) => r.status === 403 || r.status === 401
const query = (collectionId, field, op, value) => ({ structuredQuery: { from: [{ collectionId }], where: { fieldFilter: { field: { fieldPath: field }, op, value: { stringValue: value } } } } })
const queryRows = (r) => (Array.isArray(r.json) ? r.json.filter((x) => x.document) : [])
const queryRefused = (r) => refused(r) || (Array.isArray(r.json) && r.json.some((x) => x.error))

;(async () => {
  console.log(`Target: ${A.LIVE ? 'THE REAL SITE AND DATABASE' : 'local emulator'}  (${A.SITE})`)
  console.log(`Snapshots and screenshots: ${OUT}`)

  if (process.argv[2] === 'cleanup') {
    await cleanup()
    return
  }

  // ---- Before ----
  const before = await A.snapshot()
  fs.writeFileSync(path.join(OUT, 'snapshot-before.json'), JSON.stringify(before, null, 1))
  console.log('\nBefore:')
  for (const name of A.COLLECTIONS) console.log(`  ${name.padEnd(8)} ${String(before[name].length).padStart(3)} records  ${A.fingerprint(before[name])}`)
  const leftovers = ['wishes', 'gifts', 'ideas'].reduce((n, name) => n + before[name].filter((r) => marked(name, r)).length, 0) + (before.members ?? []).filter(testMember).length
  if (leftovers) {
    console.log(`\nStopping: ${leftovers} records from an earlier test run are still there. Run with "cleanup" first.`)
    process.exit(1)
  }
  for (const p of ALL) {
    if (!before.people.some((r) => r.id === p)) {
      console.log(`\nStopping: there's no people/${p} record to test as.`)
      process.exit(1)
    }
  }

  // Records about each person that were there before (real ones, on the live
  // site). Nobody may see these about themselves either. Gifts from someone's
  // list share the wish's title, which they do see, so those are checked by
  // the claim markers instead.
  const realSecrets = (p) => {
    const ownTitles = new Set(before.wishes.filter((w) => w.data.ownerId === p).map((w) => w.data.title))
    return [
      ...before.gifts.filter((g) => g.data.recipientId === p).flatMap((g) => [ownTitles.has(g.data.title) ? null : g.data.title, g.data.notes]),
      ...before.ideas.filter((i) => i.data.aboutId === p).map((i) => i.data.text),
    ].filter((s) => typeof s === 'string' && s.trim().length >= 6)
  }

  // ---- Temporary accounts and family-list entries (not as the family) ----
  // Account first, then the members entry: the order the real ones are made in.
  if (!A.FAMILY) {
    console.log('\n-- Making the four test accounts and members entries')
    for (const p of PEOPLE) {
      const email = A.testEmail(p)
      const old = await A.findAccount(email)
      if (old) await A.deleteAccount(old.localId)
      await A.createAccount(email)
      await A.putDoc('members', email, { personId: p })
      console.log(`  ${email} -> ${p}`)
    }
  }

  const browser = await chromium.launch()
  try {
    await run(browser, realSecrets)
  } finally {
    await browser.close()
    await cleanup(before)
  }

  console.log(`\n${passes} passed, ${failures} failed`)
  if (failures) console.log(failed.map((f) => `  - ${f}`).join('\n'))
  console.log(failures ? 'SOME CHECKS FAILED' : 'ALL PASSED')
  process.exit(failures ? 1 : 0)
})().catch((e) => { console.error('CRASHED', e); process.exit(1) })

async function run(browser, realSecrets) {
  const page = {}
  for (const p of PEOPLE) page[p] = await signIn(browser, p)
  const { april: ap, allie: a } = page
  const shipper = page[R.shipper]
  const second = page[R.secondSanta]

  // ---- 1. My list, as everyone ----
  for (const p of PEOPLE) {
    const pg = page[p]
    const name = NAMES[p]
    await step(`${name}'s list: add, idea, paste rows, gold star`, pg, async () => {
      await go(pg, '#/my-list', 'My list')
      await noSideScroll(pg, 'My list')

      await pg.getByRole('button', { name: /Gimme, gimme, gimme/ }).click()
      await dialog(pg).getByLabel('Link, or what it is').fill(T(`${name}'s wish`))
      await dialog(pg).getByRole('button', { name: 'Add to my list' }).click()
      await row(pg, T(`${name}'s wish`)).waitFor()

      await pg.getByRole('button', { name: /An idea/ }).click()
      await dialog(pg).getByLabel('What should Santa look for?').fill(T(`${name}'s idea`))
      await dialog(pg).getByRole('button', { name: 'Add to my list' }).click()
      await row(pg, T(`${name}'s idea`)).waitFor()

      // Rows copied from a spreadsheet: a header, one with a link, one without.
      await pg.getByRole('button', { name: /Gimme, gimme, gimme/ }).click()
      await dialog(pg).getByLabel('Link, or what it is').fill(
        `Item\tLink\tSize\n${T(`${name} pasted one`)}\thttps://example.com/m5-${p}\tLarge\n${T(`${name} pasted two`)}\t\tBlue`,
      )
      await dialog(pg).getByRole('button', { name: 'Add all 2' }).click()
      await row(pg, T(`${name} pasted two`)).waitFor()

      await pg.getByRole('button', { name: `Gold star: ${T(`${name}'s wish`)}` }).click()
      await settle(pg)

      const mine = await eventually(async () => {
        const w = (await A.list('wishes')).filter((r) => r.data.ownerId === p && r.data.title.startsWith(A.MARK))
        return w.length >= 4 && w
      })
      const byTitle = (t) => (mine || []).find((w) => w.data.title === T(t))
      await check(`${name}: wish, idea and two pasted rows are saved on ${name}'s list`, mine && mine.length === 4, pg, `${mine ? mine.length : 0} saved`)
      await check(`${name}: the idea is saved as an idea`, byTitle(`${name}'s idea`)?.data.kind === 'maybe', pg)
      await check(`${name}: the pasted row keeps its link and size; the header row is skipped`, byTitle(`${name} pasted one`)?.data.link === `https://example.com/m5-${p}` && byTitle(`${name} pasted one`)?.data.notes === 'Large' && !(await A.list('wishes')).some((w) => w.data.title === 'Item' && w.data.ownerId === p), pg)
      await check(`${name}: gold star saved`, (await eventually(async () => (await A.list('wishes')).find((w) => w.data.title === T(`${name}'s wish`) && w.data.topPick === true))) !== undefined, pg)

      // Take one off.
      await pg.getByRole('button', { name: `Change ${T(`${name} pasted two`)}` }).click()
      await dialog(pg).getByRole('button', { name: 'Take off my list' }).click()
      await settle(pg)
      const gone = await eventually(async () => !(await A.list('wishes')).some((w) => w.data.title === T(`${name} pasted two`)))
      await check(`${name}: Take off my list removes it`, gone, pg)
    })
  }

  // ---- 2. Every shopping page shows the others' new wishes ----
  for (const p of PEOPLE) {
    const pg = page[p]
    await step(`${NAMES[p]} opens every shopping page`, pg, async () => {
      for (const other of PEOPLE.filter((o) => o !== p)) {
        await go(pg, `#/shop/${other}`, NAMES[other])
        const seen = await row(pg, T(`${NAMES[other]}'s wish`)).first().waitFor({ timeout: 10000 }).then(() => true, () => false)
        await check(`${NAMES[p]} sees ${NAMES[other]}'s new wish on ${NAMES[other]}'s page`, seen, pg)
        await noSideScroll(pg, `${NAMES[other]}'s page`)
      }
      // Their own shopping page is just their list.
      await go(pg, `#/shop/${p}`)
      await check(`${NAMES[p]}: their own shopping page shows My list instead`, (await pg.getByRole('heading', { name: 'My list' }).count()) === 1, pg)
    })
  }

  // ---- 3. Allie on Kevin's wish: I'll be Santa, ship, stocking, Not getting it ----
  const kevinWish = T("Kevin's wish")
  await step("Allie: I'll be Santa on Kevin's wish, then each Change", a, async () => {
    await go(a, '#/shop/kevin', 'Kevin')
    await row(a, kevinWish).getByRole('button', { name: "I'll be Santa" }).click()
    await row(a, kevinWish).getByText("Santa's got it").waitFor()
    let g = await findGift(kevinWish, (g) => g.data.giverId === 'allie')
    await check("I'll be Santa saves a gift for Kevin, from Allie", g?.data.recipientId === 'kevin' && Boolean(g?.data.wishItemId), a)
    const asked = (await row(a, kevinWish).innerText()).includes('Shipping it to')
    const allieShips = (await A.list('gifts')).some((x) => x.data.giverId === 'allie' && x.data.shipTo && x.id !== g?.id)
    if (!allieShips) await check('Allie, who has never shipped, is not asked about shipping', !asked, a)

    await row(a, kevinWish).getByRole('button', { name: /Change/ }).click()
    await dialog(a).getByRole('button', { name: "To April's" }).click()
    await dialog(a).getByRole('button', { name: 'Save' }).click()
    await row(a, kevinWish).getByText(/to April's/).waitFor()
    g = await eventually(async () => (await A.list('gifts')).find((x) => x.id === g.id && x.data.shipTo === 'april'))
    await check("Change: shipping to April's is saved and shows", Boolean(g), a)

    await row(a, kevinWish).getByRole('button', { name: /Change/ }).click()
    await dialog(a).getByRole('button', { name: 'Not shipping' }).click()
    await dialog(a).getByRole('button', { name: 'Stocking' }).click()
    await dialog(a).getByLabel('Notes for the family').fill(T('note from Allie'))
    await dialog(a).getByRole('button', { name: 'Save' }).click()
    await row(a, kevinWish).getByText(/stocking/).waitFor()
    g = await eventually(async () => (await A.list('gifts')).find((x) => x.id === g.id && !('shipTo' in x.data) && x.data.place === 'stocking'))
    await check('Change: "Not shipping" clears shipping, Stocking and a note are saved', g?.data.notes === T('note from Allie'), a)
    await check('...and the row says stocking, not "to April\'s"', !(await row(a, kevinWish).innerText()).includes("to April's"), a)

    await row(a, kevinWish).getByRole('button', { name: /Change/ }).click()
    await dialog(a).getByRole('button', { name: 'Not getting it' }).click()
    await row(a, kevinWish).getByText('Needs Santa').waitFor()
    await check('"Not getting it" deletes the gift and the wish needs a Santa again', await eventually(async () => !(await A.list('gifts')).some((x) => x.id === g.id)), a)

    // Claim it again, to leave a claim for Kevin's checks.
    await row(a, kevinWish).getByRole('button', { name: "I'll be Santa" }).click()
    await row(a, kevinWish).getByText("Santa's got it").waitFor()
  })

  // ---- 4. Surprises, Overheard and Make it a gift: one of each about everyone ----
  async function surprise(pg, giver, recipient, title, { place, shipTo } = {}) {
    await go(pg, `#/shop/${recipient}`, NAMES[recipient])
    await pg.getByRole('button', { name: 'Add a gift' }).last().click()
    await dialog(pg).getByLabel('Link, or what it is').fill(title)
    if (place) await dialog(pg).getByRole('button', { name: place }).click()
    if (shipTo) await dialog(pg).getByRole('button', { name: shipTo }).click()
    await dialog(pg).getByRole('button', { name: 'Save' }).click()
    await row(pg, title).first().waitFor()
    const g = await findGift(title)
    await check(`${NAMES[giver]}: a surprise for ${NAMES[recipient]} is saved, from ${NAMES[giver]}`, g?.data.recipientId === recipient && g?.data.giverId === giver, pg)
    return g
  }
  async function overheard(pg, author, about, text) {
    await go(pg, `#/shop/${about}`, NAMES[about])
    await pg.getByLabel('Add something you heard').fill(text)
    await pg.getByLabel('Add something you heard').press('Enter')
    await row(pg, text).waitFor()
    const i = await eventually(async () => (await A.list('ideas')).find((x) => x.data.text === text))
    await check(`${NAMES[author]}: an Overheard note about ${NAMES[about]} is saved, by ${NAMES[author]}`, i?.data.aboutId === about && i?.data.authorId === author, pg)
    return i
  }

  const S = NAMES[R.shipper]
  await step(`${S}: a surprise for ${NAMES[R.shipFor]} shipped to April's, then a claim gets the shipping question`, shipper, async () => {
    await surprise(shipper, R.shipper, R.shipFor, SHIPPED, { shipTo: "To April's" })
    const s = await findGift(SHIPPED, (g) => g.data.shipTo === 'april')
    await check("...shipping to April's", Boolean(s), shipper)

    // Shipped before, so I'll be Santa asks.
    await go(shipper, '#/shop/allie', 'Allie')
    const allieWish = T("Allie's wish")
    await row(shipper, allieWish).getByRole('button', { name: "I'll be Santa" }).click()
    const asked = await row(shipper, allieWish).getByText(/Shipping it to .+\?/).waitFor({ timeout: 8000 }).then(() => true, () => false)
    await check(`After I'll be Santa, ${S} is asked "Shipping it to …?"`, asked, shipper)
    if (asked) {
      await row(shipper, allieWish).getByRole('button', { name: 'Yes' }).click()
      await row(shipper, allieWish).getByText(/to .+'s/).first().waitFor()
      const g = await findGift(allieWish, (g) => g.data.giverId === R.shipper && Boolean(g.data.shipTo))
      await check('Yes saves the shipping', Boolean(g), shipper)
      await check('...and the question goes away', !(await row(shipper, allieWish).innerText()).includes('Shipping it to'), shipper)
    }
    await overheard(shipper, R.shipper, 'allie', T('overheard about Allie'))
  })

  const K = NAMES[R.secondSanta]
  await step(`${K}: claims the same wish (two Santas), and a note about Brady`, second, async () => {
    await go(second, '#/shop/allie', 'Allie')
    const allieWish = T("Allie's wish")
    const shown = await row(second, allieWish).innerText()
    await check(`${K} sees ${S} already has Allie's wish`, shown.includes(S) && shown.includes("Santa's got it"), second)
    // Two people at the same moment: written straight in (as them, under the
    // rules), as if their tap crossed with the first Santa's.
    const wish = (await A.list('wishes')).find((w) => w.data.title === allieWish)
    const at = new Date().toISOString()
    await A.writeAs(R.secondSanta, 'gifts', 'm5-test-two-santas', { recipientId: 'allie', giverId: R.secondSanta, title: allieWish, wishItemId: wish.id, place: 'tree', createdAt: at, updatedAt: at, updatedBy: R.secondSanta })
    await settle(second)
    const both = await eventually(async () => {
      const t = await row(second, allieWish).first().innerText()
      // They see themselves as "You".
      return t.includes(S) && /\bYou\b/.test(t) && t.includes('Two Santas on this one') && t
    })
    await check('Two Santas on one wish: both names show, with the note to sort it out', Boolean(both), second)

    // Kevin's claim on April's wish, no shipping question for someone who never ships.
    if (R.secondSanta === 'kevin') {
      await go(second, '#/shop/april', 'April')
      const aprilWish = T("April's wish")
      await row(second, aprilWish).getByRole('button', { name: "I'll be Santa" }).click()
      await row(second, aprilWish).getByText("Santa's got it").waitFor()
      await settle(second)
      const kevinShips = (await A.list('gifts')).some((x) => x.data.giverId === 'kevin' && x.data.shipTo)
      if (!kevinShips) await check('Kevin, who never ships, is not asked about shipping', !(await row(second, aprilWish).innerText()).includes('Shipping it to'), second)
    }
    await overheard(second, R.secondSanta, 'brady', T('overheard about Brady'))
  })

  await step('Allie: a surprise for April and one for Kevin; a note about April made into a gift', a, async () => {
    await surprise(a, 'allie', 'april', T('surprise for April from Allie'))
    await surprise(a, 'allie', 'kevin', T('surprise for Kevin from Allie'))
    await overheard(a, 'allie', 'april', T('overheard about April'))
    await row(a, T('overheard about April')).getByRole('button', { name: 'Make it a gift' }).click()
    await dialog(a).getByLabel('Link, or what it is').fill(T('gift for April from a note'))
    await dialog(a).getByRole('button', { name: 'Save' }).click()
    await row(a, T('gift for April from a note')).first().waitFor()
    const i = await eventually(async () => (await A.list('ideas')).find((x) => x.data.text === T('overheard about April') && x.data.madeIntoGift === true))
    await check('Make it a gift marks the note and saves the gift', Boolean(i) && Boolean(await findGift(T('gift for April from a note'))), a)
    const overheardText = await a.locator('section', { has: a.getByRole('heading', { name: 'Overheard' }) }).innerText()
    await check('...and the note leaves Overheard', !overheardText.includes(T('overheard about April')), a)
  })

  await step(`April (phone): a stocking gift under ${NAMES[R.ideaOf]}'s idea, a surprise, a note, Change and Take it off`, ap, async () => {
    await go(ap, `#/shop/${R.ideaOf}`, NAMES[R.ideaOf])
    await noSideScroll(ap, `${NAMES[R.ideaOf]}'s page`)
    const idea = T(`${NAMES[R.ideaOf]}'s idea`)
    await row(ap, idea).getByRole('button', { name: 'Add a gift' }).click()
    await dialog(ap).getByLabel('Link, or what it is').fill(IDEA_GIFT)
    await dialog(ap).getByRole('button', { name: 'Stocking' }).click()
    await dialog(ap).getByRole('button', { name: 'Save' }).click()
    await row(ap, IDEA_GIFT).first().waitFor()
    const g = await findGift(IDEA_GIFT)
    await check('April: a gift under an idea is saved, in the stocking, linked to the idea', g?.data.place === 'stocking' && Boolean(g?.data.wishItemId), ap)
    await surprise(ap, 'april', 'brady', T('surprise for Brady from April'))
    await overheard(ap, 'april', 'kevin', T('overheard about Kevin'))
    await noSideScroll(ap, "Kevin's page")

    // Someone else's gift: Change a note on the shipper's, take Allie's off.
    await go(ap, `#/shop/${R.shipFor}`, NAMES[R.shipFor])
    await row(ap, SHIPPED).first().getByRole('button', { name: /Change/ }).click()
    await check("Someone else's gift says Take it off, not Not getting it", (await dialog(ap).getByRole('button', { name: 'Take it off' }).count()) === 1, ap)
    await dialog(ap).getByLabel('Notes for the family').fill(T('note from April'))
    await dialog(ap).getByRole('button', { name: 'Save' }).click()
    await row(ap, SHIPPED).first().getByText(T('note from April')).waitFor()
    const changed = await findGift(SHIPPED, (x) => x.data.notes === T('note from April'))
    await check(`April's note on ${S}'s gift is saved, marked as changed by April, still ${S}'s`, changed?.data.updatedBy === 'april' && changed?.data.giverId === R.shipper, ap)

    await go(ap, '#/shop/kevin', 'Kevin')
    await row(ap, T('surprise for Kevin from Allie')).first().getByRole('button', { name: /Change/ }).click()
    await dialog(ap).getByRole('button', { name: 'Take it off' }).click()
    await settle(ap)
    await check("Take it off removes Allie's gift", await eventually(async () => !(await A.list('gifts')).some((x) => x.data.title === T('surprise for Kevin from Allie'))), ap)
  })

  // ---- 5. Santa's sack ----
  await step("Santa's sack, as everyone", shipper, async () => {
    const section = (pg, name) => pg.locator('section', { has: pg.getByRole('heading', { name }) })
    await go(shipper, '#/sack', "Santa's sack")
    await check(`${S}'s sack: Allie's wish under For Allie, with where it ships`, /to .+'s/.test(await row(section(shipper, 'For Allie'), T("Allie's wish")).first().innerText().catch(() => '')), shipper)
    await check(`${S}'s sack: the surprise for ${NAMES[R.shipFor]}, to April's`, (await row(section(shipper, `For ${NAMES[R.shipFor]}`), SHIPPED).first().innerText().catch(() => '')).includes("to April's"), shipper)

    await go(ap, '#/sack', "Santa's sack")
    await noSideScroll(ap, "Santa's sack")
    const from = `From ${S}, for ${NAMES[R.shipFor]}`
    await check(`April's sack: ${S}'s surprise is "Landing at your place", "${from}"`, (await row(section(ap, 'Landing at your place'), SHIPPED).first().innerText().catch(() => '')).includes(from), ap)
    const forIdea = await section(ap, `For ${NAMES[R.ideaOf]}`).innerText().catch(() => '')
    await check(`April's sack: her stocking gift for ${NAMES[R.ideaOf]}`, forIdea.includes(IDEA_GIFT) && forIdea.includes('stocking'), ap)
    await check("April's sack: her surprise for Brady", (await section(ap, 'For Brady').innerText().catch(() => '')).includes(T('surprise for Brady from April')), ap)

    const giving = {
      allie: [T("Kevin's wish"), T('surprise for April from Allie'), T('gift for April from a note')],
      kevin: [T("Allie's wish"), A.FAMILY ? SHIPPED : T("April's wish")],
    }
    for (const p of ['allie', 'kevin']) {
      await go(page[p], '#/sack', "Santa's sack")
      const text = await page[p].locator('main').innerText()
      await check(`${NAMES[p]}'s sack lists what ${NAMES[p]} is getting people`, giving[p].every((t) => text.includes(t)), page[p])
    }

    // Allie takes her wish off her list: Brady's sack says so.
    await go(a, '#/my-list', 'My list')
    await a.getByRole('button', { name: `Change ${T("Allie's wish")}` }).click()
    await dialog(a).getByRole('button', { name: 'Take off my list' }).click()
    await settle(a)
    await go(shipper, '#/sack', "Santa's sack")
    const gone = await shipper.getByText("No longer on Allie's list").first().waitFor({ timeout: 10000 }).then(() => true, () => false)
    await check(`${S}'s sack: a wish taken off the list shows "No longer on Allie's list"`, gone, shipper)
  })

  // ---- 6. Spreadsheets ----
  const sheets = {}
  for (const p of PEOPLE) {
    await step(`${NAMES[p]} downloads the spreadsheet`, page[p], async () => {
      sheets[p] = await spreadsheet(page[p])
      fs.writeFileSync(path.join(OUT, `spreadsheet-${p}.csv`), sheets[p])
    })
  }
  await check("Allie's spreadsheet has her claim on Kevin's wish and her surprise for April", (sheets.allie ?? '').includes(T("Kevin's wish")) && (sheets.allie ?? '').includes(T('surprise for April from Allie')))
  await check(`April's spreadsheet has her stocking gift for ${NAMES[R.ideaOf]}`, (sheets.april ?? '').includes(IDEA_GIFT))

  // ---- 7. Nobody sees anything about themselves ----
  const all = { gifts: await A.list('gifts'), ideas: await A.list('ideas'), wishes: await A.list('wishes') }
  for (const p of PEOPLE) {
    const pg = page[p]
    await step(`${NAMES[p]}: nothing about ${NAMES[p]} anywhere on the site`, pg, async () => {
      const ownTitles = new Set(all.wishes.filter((w) => w.data.ownerId === p).map((w) => w.data.title))
      // Test records about them: surprise titles, family notes, overheard notes.
      const testSecrets = [
        ...all.gifts.filter((g) => g.data.recipientId === p && marked('gifts', g)).flatMap((g) => [ownTitles.has(g.data.title) ? null : g.data.title, g.data.notes]),
        ...all.ideas.filter((i) => i.data.aboutId === p && marked('ideas', i)).map((i) => i.data.text),
      ].filter(Boolean)
      await check(`(there are test gifts or notes about ${NAMES[p]} to look for: ${testSecrets.length})`, testSecrets.length > 0)

      const pages = {}
      for (const hash of ['', '#/my-list', ...ALL.map((o) => `#/shop/${o}`), '#/sack']) {
        await go(pg, hash)
        pages[hash || 'Home'] = await pg.locator('body').innerText()
      }
      pages.spreadsheet = sheets[p] ?? ''
      for (const [where, text] of Object.entries(pages)) {
        const leaked = testSecrets.filter((s) => text.includes(s))
        await check(`${NAMES[p]}: ${where} shows no gift or note about ${NAMES[p]}`, leaked.length === 0, leaked.length ? pg : null, leaked.join(' | '))
        const real = realSecrets(p).filter((s) => text.includes(s)).length
        if (realSecrets(p).length) await check(`${NAMES[p]}: ${where} shows none of the ${realSecrets(p).length} real gifts or notes about ${NAMES[p]}`, real === 0, null, `${real} real record(s) showed; not printed`)
      }
      // Their own list: no sign of who's getting what.
      await go(pg, '#/my-list', 'My list')
      const mine = await pg.locator('main').innerText()
      await check(`${NAMES[p]}'s own list shows no claims ("Santa's got it", Santas, shipping)`, !/Santa's got it|Needs Santa|Santas on this one|Shipping it to/.test(mine), pg)
    })
  }

  // ---- 8. The database refuses, asked directly with each person's sign-in ----
  const others = (p) => PEOPLE.filter((o) => o !== p)
  for (const p of PEOPLE) {
    await step(`${NAMES[p]}: the database itself refuses what's about ${NAMES[p]}`, null, async () => {
      const token = await A.tokenOf(p)
      const name = NAMES[p]
      const giftAbout = all.gifts.find((g) => g.data.recipientId === p && marked('gifts', g))
      const ideaAbout = all.ideas.find((i) => i.data.aboutId === p && marked('ideas', i))
      const at = new Date().toISOString()
      const giftFor = (recipientId, extra = {}) => ({ fields: A.fieldsOf({ recipientId, giverId: p, title: T('should be refused'), place: 'tree', createdAt: at, updatedAt: at, updatedBy: p, ...extra }) })

      const allowed = await asPerson(token, 'POST', `${A.DB}:runQuery`, query('gifts', 'recipientId', 'NOT_EQUAL', p))
      const rows = queryRows(allowed)
      await check(`${name}: can read the gifts for everyone else (sign-in works)`, allowed.status === 200 && rows.length > 0 && rows.every((r) => r.document.fields.recipientId.stringValue !== p), null, String(allowed.status))
      await check(`${name}: listing all gifts is refused`, refused(await asPerson(token, 'GET', `${A.DB}/gifts?pageSize=5`)))
      await check(`${name}: listing all overheard notes is refused`, refused(await asPerson(token, 'GET', `${A.DB}/ideas?pageSize=5`)))
      await check(`${name}: searching for gifts for ${name} is refused`, queryRefused(await asPerson(token, 'POST', `${A.DB}:runQuery`, query('gifts', 'recipientId', 'EQUAL', p))))
      await check(`${name}: searching for notes about ${name} is refused`, queryRefused(await asPerson(token, 'POST', `${A.DB}:runQuery`, query('ideas', 'aboutId', 'EQUAL', p))))
      if (giftAbout) await check(`${name}: opening a gift for ${name} by its address is refused`, refused(await asPerson(token, 'GET', `${A.DB}/gifts/${giftAbout.id}`)))
      if (ideaAbout) await check(`${name}: opening a note about ${name} by its address is refused`, refused(await asPerson(token, 'GET', `${A.DB}/ideas/${ideaAbout.id}`)))
      if (giftAbout) await check(`${name}: deleting a gift for ${name} is refused`, refused(await asPerson(token, 'DELETE', `${A.DB}/gifts/${giftAbout.id}`)))
      await check(`${name}: reading their own members entry works`, (await asPerson(token, 'GET', `${A.DB}/members/${encodeURIComponent(A.emailOf(p))}`)).status === 200)
      await check(`${name}: reading someone else's members entry is refused`, refused(await asPerson(token, 'GET', `${A.DB}/members/${encodeURIComponent(A.emailOf(others(p)[0]))}`)))
      await check(`${name}: adding a members entry is refused`, refused(await asPerson(token, 'POST', `${A.DB}/members?documentId=m5-test-intruder@example.com`, { fields: A.fieldsOf({ personId: p }) })))
      await check(`${name}: changing people is refused`, refused(await asPerson(token, 'PATCH', `${A.DB}/people/${p}?updateMask.fieldPaths=santasList`, { fields: A.fieldsOf({ santasList: 'nice' }) })))
      await check(`${name}: saving a gift to themselves is refused`, refused(await asPerson(token, 'POST', `${A.DB}/gifts?documentId=m5-test-self-${p}`, giftFor(p))))
      await check(`${name}: saving a gift as if from someone else's tap is refused`, refused(await asPerson(token, 'POST', `${A.DB}/gifts?documentId=m5-test-spoof-${p}`, giftFor(others(p)[0], { updatedBy: others(p)[1] }))))
      const otherWish = all.wishes.find((w) => w.data.ownerId === others(p)[0] && marked('wishes', w))
      if (otherWish) await check(`${name}: changing someone else's wish is refused`, refused(await asPerson(token, 'PATCH', `${A.DB}/wishes/${otherWish.id}?updateMask.fieldPaths=title`, { fields: A.fieldsOf({ title: T('changed by someone else') }) })))
      // The stricter M5 rules: real people only, known fields only.
      await check(`${name}: (stricter rules) a gift for a misspelled person ("${NAMES[others(p)[0]]}" with a capital) is refused`, refused(await asPerson(token, 'POST', `${A.DB}/gifts?documentId=m5-test-typo-${p}`, giftFor(NAMES[others(p)[0]]))))
      await check(`${name}: (stricter rules) a gift with a field the site never writes is refused`, refused(await asPerson(token, 'POST', `${A.DB}/gifts?documentId=m5-test-field-${p}`, giftFor(others(p)[0], { price: '$1,000,000' }))))
      await check(`${name}: (stricter rules) a gift shipped to a house that doesn't exist is refused`, refused(await asPerson(token, 'POST', `${A.DB}/gifts?documentId=m5-test-home-${p}`, giftFor(others(p)[0], { shipTo: 'nowhere' }))))
    })
  }

  // ---- 9. No errors ----
  for (const p of PEOPLE) {
    // The emulator's warning and Firestore's own retry chatter aren't the site's errors.
    const errors = page[p].errors.filter((e) => !/emulator|WebChannelConnection|transport errored/i.test(e))
    // April's one wrong password on purpose: the browser logs Firebase's 400 for it.
    const wrongTry = p === 'april' ? errors.findIndex((e) => /status of 400/.test(e)) : -1
    if (wrongTry >= 0) errors.splice(wrongTry, 1)
    await check(`${NAMES[p]}: no errors in the browser`, errors.length === 0, null, errors.join(' | ').slice(0, 300))
  }

  // April's pages, for looking at.
  for (const [hash, file] of [['', 'home'], ['#/my-list', 'my-list'], ['#/shop/allie', 'shop-allie'], ['#/sack', 'sack']]) {
    await go(ap, hash)
    await ap.screenshot({ path: path.join(OUT, `april-phone-${file}.png`), fullPage: true })
  }
}

// ---- Cleanup: only what this test made, then compare with before ----
async function cleanup(before) {
  console.log('\n-- Cleaning up')
  const isNew = (name, r) => !before || !before[name].some((x) => x.id === r.id)
  let removed = 0
  for (const name of ['gifts', 'ideas', 'wishes']) {
    for (const r of await A.list(name)) {
      if (marked(name, r) && isNew(name, r)) {
        await A.remove(name, r)
        removed++
      }
    }
  }
  if (A.FAMILY) {
    console.log(`  deleted ${removed} test records`)
  } else {
    await cleanupTestPeople(removed)
  }
  if (before) await compareWithBefore(before)
}

// Owner runs only: the four test members entries and accounts.
async function cleanupTestPeople(removed) {
  for (const r of await A.list('members')) {
    if (testMember(r)) {
      await A.deleteDoc('members', r.id)
      removed++
    }
  }
  let accounts = 0
  for (const p of [...PEOPLE, 'intruder']) {
    const user = await A.findAccount(A.testEmail(p)).catch(() => null)
    if (user) {
      await A.deleteAccount(user.localId)
      accounts++
    }
  }
  console.log(`  deleted ${removed} test records and members entries, and ${accounts} test accounts`)
  for (const p of PEOPLE) {
    await check(`Test account for ${p} is gone`, !(await A.findAccount(A.testEmail(p))))
  }
}

async function compareWithBefore(before) {
  const after = await A.snapshot()
  fs.writeFileSync(path.join(OUT, 'snapshot-after.json'), JSON.stringify(after, null, 1))
  console.log('\nAfter (should match Before):')
  for (const name of A.COLLECTIONS) {
    const same = A.fingerprint(after[name]) === A.fingerprint(before[name])
    console.log(`  ${name.padEnd(8)} ${String(after[name].length).padStart(3)} records  ${A.fingerprint(after[name])}  ${same ? 'same' : 'DIFFERENT'}`)
    const changed = before[name].filter((r) => {
      const now = after[name].find((x) => x.id === r.id)
      return !now || JSON.stringify(now) !== JSON.stringify(r)
    })
    const extra = after[name].filter((r) => !before[name].some((x) => x.id === r.id))
    await check(`${name}: every record from before is still there, unchanged`, changed.length === 0, null, `${changed.length} changed or missing`)
    if (extra.length) {
      const fromTest = extra.filter((r) => marked(name, r) || testMember(r)).length
      await check(`${name}: nothing left over from the test`, fromTest === 0, null, `${fromTest} left`)
      console.log(`  (${extra.length - fromTest} new ${name} records added by someone else during the run were left alone)`)
    }
  }
}
