// The real site and database, from outside the family: needs no admin access.
//   node tests/live/outside.cjs
//   FAMILY_EMAILS='april=…,allie=…,kevin=…' node tests/live/outside.cjs   (adds one check)
// Checks: the live site loads with no errors (desktop, and April's phone at
// larger text); a wrong password says so; the database refuses every read and
// write from someone not signed in; refuses an account someone makes for
// themselves (made, checked, then deleted again); and, with FAMILY_EMAILS,
// that nobody can make a new account with a family email (it's taken).
// The emails come only from the environment and are never printed.
// Screenshots go to $SHOTS (default: a temp folder).

const { chromium } = require('playwright')
const os = require('os')
const path = require('path')
const fs = require('fs')

const PROJECT = 'family-christmas-d65ce'
const API_KEY = 'AIzaSyAbM_fXWHKdcf7PKUvB5Tt3L4f45Uewos4' // public, same as the site's
const SITE = process.env.SITE || 'https://bgs3jc.github.io/christmas-list/'
const DB = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`
const COLLECTIONS = ['members', 'people', 'homes', 'wishes', 'gifts', 'ideas']
const SHOTS = process.env.SHOTS || fs.mkdtempSync(path.join(os.tmpdir(), 'outside-'))

let failures = 0
const check = (label, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && extra ? `  (${extra})` : ''}`); if (!ok) failures++ }

async function call(url, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let json = {}
  try { json = await r.json() } catch {}
  return { status: r.status, json }
}

const refused = (r) => r.status === 403 || r.status === 401

// Every way of reading or writing, as `token` (undefined = not signed in).
async function everyDoor(who, token) {
  for (const name of COLLECTIONS) {
    const r = await call(`${DB}/${name}?pageSize=5`, { token })
    check(`${who}: listing ${name} is refused`, refused(r), `${r.status}, ${r.json.documents?.length ?? 0} records`)
  }
  for (const [name, id] of [['people', 'brady'], ['homes', 'april'], ['members', 'someone@example.com']]) {
    const r = await call(`${DB}/${name}/${id}`, { token })
    check(`${who}: opening ${name}/${id} is refused`, refused(r), String(r.status))
  }
  const q = await call(`${DB}:runQuery`, { method: 'POST', token, body: { structuredQuery: { from: [{ collectionId: 'gifts' }], where: { fieldFilter: { field: { fieldPath: 'recipientId' }, op: 'NOT_EQUAL', value: { stringValue: 'nobody' } } } } } })
  check(`${who}: searching gifts is refused`, refused(q) || (Array.isArray(q.json) && q.json[0]?.error), String(q.status))
  const w = await call(`${DB}/wishes?documentId=m5-outside-test`, { method: 'POST', token, body: { fields: { ownerId: { stringValue: 'brady' }, kind: { stringValue: 'specific' }, title: { stringValue: 'TEST M5 outsider' }, topPick: { booleanValue: false }, order: { integerValue: '1' }, createdAt: { stringValue: '2026-11-10' } } } })
  check(`${who}: saving a wish is refused`, refused(w), String(w.status))
  const m = await call(`${DB}/members?documentId=m5-outside-test@example.com`, { method: 'POST', token, body: { fields: { personId: { stringValue: 'brady' } } } })
  check(`${who}: adding themselves to the family list is refused`, refused(m), String(m.status))
}

;(async () => {
  // ---- The database ----
  await everyDoor('Not signed in', undefined)

  // An account someone makes for themselves: not verified, not on the family list.
  const email = `m5-test-selfmade-${Date.now()}@example.com`
  const made = await call(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, { method: 'POST', body: { email, password: `M5-${Math.random().toString(36).slice(2)}-x9`, returnSecureToken: true } })
  if (made.json.idToken) {
    await everyDoor('Self-made account', made.json.idToken)
    const gone = await call(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { method: 'POST', body: { idToken: made.json.idToken } })
    check('The self-made test account is deleted again', gone.status === 200, JSON.stringify(gone.json).slice(0, 200))
  } else {
    // Sign-up turned off is also fine: nobody can make an account at all.
    check(`Making an account is refused outright (${made.json.error?.message ?? made.status})`, made.status >= 400)
  }

  // Nobody can make an account with a family email: each already has one.
  // This is what makes the password sign-in safe (see firestore.rules).
  const family = (process.env.FAMILY_EMAILS || '').split(',').map((pair) => pair.split('=').map((x) => x.trim())).filter(([who, e]) => who && e)
  for (const [who, familyEmail] of family) {
    const tried = await call(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, { method: 'POST', body: { email: familyEmail, password: `M5-${Math.random().toString(36).slice(2)}-x9`, returnSecureToken: true } })
    check(`Making a new account with ${who}'s email is refused (it's taken)`, tried.json.error?.message === 'EMAIL_EXISTS', `${tried.status} ${tried.json.error?.message ?? 'an account was made'}`)
    // If it ever wasn't taken, don't leave a stranger's account behind.
    if (tried.json.idToken) await call(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { method: 'POST', body: { idToken: tried.json.idToken } })
  }

  // ---- The site ----
  const browser = await chromium.launch()
  const looks = [
    ['desktop', { viewport: { width: 1280, height: 860 } }, false],
    ['April phone, larger text', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, true],
  ]
  for (const [label, options, bigText] of looks) {
    const ctx = await browser.newContext(options)
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
    if (bigText) await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = '120%')))
    await page.goto(SITE)
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true })
    const ok = await signInButton.waitFor({ timeout: 15000 }).then(() => true, () => false)
    check(`Site (${label}): the sign-in page shows`, ok)
    check(`Site (${label}): email, family password and the Google button are there`, (await page.getByLabel('Your email').count()) === 1 && (await page.getByLabel('Family password').getAttribute('type').catch(() => '')) === 'password' && (await page.getByRole('button', { name: /Google/ }).count()) === 1)
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    check(`Site (${label}): nothing runs off the side`, wide <= 1, `${wide}px too wide`)
    await page.screenshot({ path: path.join(SHOTS, `outside-${label.replace(/\W+/g, '-')}.png`), fullPage: true })

    // A made-up email and password: says so, doesn't sign in.
    await page.getByLabel('Your email').fill('m5-test-nobody@example.com')
    await page.getByLabel('Family password').fill('not-the-family-password')
    await signInButton.click()
    const said = await page.getByRole('alert').filter({ hasText: "That email and family password don't match" }).waitFor({ timeout: 15000 }).then(() => true, () => false)
    check(`Site (${label}): a wrong email and password says they don't match, and nobody is signed in`, said && (await page.getByText('Who are you shopping for?').count()) === 0)
    await page.screenshot({ path: path.join(SHOTS, `outside-wrong-password-${label.replace(/\W+/g, '-')}.png`), fullPage: true })

    // An old sign-in link from before the family password: the sign-in page, with the code gone.
    await page.goto(`${SITE}?mode=signIn&oobCode=made-up-code&apiKey=${API_KEY}`)
    const plain = await signInButton.waitFor({ timeout: 10000 }).then(() => true, () => false)
    check(`Site (${label}): an old sign-in link opens the sign-in page, with its code gone from the address bar`, plain && !page.url().includes('oobCode'))

    // The browser logs Firebase's refusal of the wrong password (a 400); that one is expected.
    const real = errors.filter((e) => !/status of 400/.test(e))
    check(`Site (${label}): no errors in the browser`, real.length === 0, real.join(' | ').slice(0, 300))
    await ctx.close()
  }
  await browser.close()
  console.log(`Screenshots: ${SHOTS}`)
  console.log(failures ? `${failures} FAILED` : 'ALL PASSED')
  process.exit(failures ? 1 : 0)
})().catch((e) => { console.error('CRASHED', e); process.exit(1) })
