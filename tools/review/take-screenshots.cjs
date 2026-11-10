// Retakes the review pack in docs/review/ (PNG; convert to WebP after).
// Needs fresh sample data, so restart the emulators first:
//   npm run dev:emulators          (in the background, wait for Vite's address)
//   node tools/review/take-screenshots.cjs <folder>
// Phone shots are an iPhone width at larger text (html font-size 120%).

const { chromium } = require('playwright')
const BASE = 'http://localhost:5173/christmas-list/'
const OOB = 'http://127.0.0.1:9099/emulator/v1/projects/demo-family-christmas/oobCodes'
const out = process.argv[2] ?? '.'

async function signedIn(browser, email, phone = false) {
  const ctx = await browser.newContext(phone ? { viewport: { width: 390, height: 664 } } : { viewport: { width: 1280, height: 860 } })
  const page = await ctx.newPage()
  if (phone) await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = '120%')))
  await page.goto(BASE)
  await page.waitForTimeout(800)
  if (!email) return page
  await page.getByLabel('Your email').fill(email)
  await page.getByRole('button', { name: 'Email me a sign-in link' }).click()
  await page.getByText('Check your email').waitFor()
  const { oobCodes } = await (await fetch(OOB)).json()
  const link = new URL(oobCodes.filter((c) => c.email === email).pop().oobLink)
  const target = new URL(link.searchParams.get('continueUrl'))
  for (const [k, v] of link.searchParams) if (k !== 'continueUrl') target.searchParams.set(k, v)
  await page.goto(target.toString())
  await page.getByText('Who are you shopping for?').waitFor({ timeout: 15000 })
  await page.waitForTimeout(1500)
  return page
}

async function shot(page, name, { hash, fullPage = false, before } = {}) {
  if (hash !== undefined) {
    await page.goto(BASE + hash)
    await page.waitForTimeout(1200)
  }
  if (before) {
    await before(page)
    await page.waitForTimeout(600)
  }
  await page.screenshot({ path: `${out}/${name}.png`, fullPage })
  await page.keyboard.press('Escape')
  console.log(name)
}

;(async () => {
  const browser = await chromium.launch()
  await shot(await signedIn(browser), '01-sign-in')

  const b = await signedIn(browser, 'brady@example.com')
  await shot(b, '02-home', { fullPage: true })
  await shot(b, '03-my-list', { hash: '#/my-list' })
  await shot(b, '04-add-gimme', { before: (p) => p.getByRole('button', { name: /Gimme, gimme, gimme/ }).click() })
  await shot(b, '05-add-idea', { before: (p) => p.getByRole('button', { name: /An idea/ }).click() })
  await shot(b, '06-shopping-allie', { hash: '#/shop/allie', fullPage: true })
  await shot(b, '07-add-gift', { before: (p) => p.getByRole('button', { name: 'Add a gift' }).last().click() })
  await shot(b, '08-shopping-april', { hash: '#/shop/april' })
  await shot(b, '12-sack', { hash: '#/sack', fullPage: true })

  const a = await signedIn(browser, 'april@example.com', true)
  await shot(a, '09-phone-april-home')
  await shot(a, '10-phone-april-my-list', { hash: '#/my-list', fullPage: true })
  await shot(a, '11-phone-april-shopping-allie', { hash: '#/shop/allie', fullPage: true })
  await shot(a, '13-phone-april-sack', { hash: '#/sack', fullPage: true })
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
