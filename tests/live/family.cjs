// The real site and database with no admin access: signs in as April, Allie
// and Kevin with the family password, like any visitor. For
// tests/live-site.e2e.cjs with TARGET=live-family. Brady's own view is
// covered by the emulator run (Brady signs in with Google, which a test can't).
//
//   TARGET=live-family FAMILY_PASSWORD=… FAMILY_EMAILS='april=…,allie=…,kevin=…' \
//     node tests/live-site.e2e.cjs
//
// The password and emails come only from the environment. They're never
// written to a file, and every line this test prints has them blanked out.
//
// Seeing the whole database without admin access: each person can read
// everything except what's about them, so the three together see every wish,
// gift and note. Brady is never signed in as, so gifts and notes about him
// are seen by all three. (The members list can't be read this way; it's left
// out of the before/after comparison.)

const A = require('./admin.cjs')

// TARGET=emulator-family runs the same thing against the local emulator
// (FAMILY_PASSWORD=emulator-family-password, example.com emails), to try it first.
if (!['live-family', 'emulator-family'].includes(process.env.TARGET)) throw new Error('family.cjs is only for TARGET=live-family or emulator-family')

const PASSWORD = process.env.FAMILY_PASSWORD || ''
const EMAILS = Object.fromEntries(
  (process.env.FAMILY_EMAILS || '')
    .split(',')
    .map((pair) => pair.split('=').map((s) => s.trim()))
    .filter(([who, email]) => who && email)
    .map(([who, email]) => [who.toLowerCase(), email.toLowerCase()]),
)
const PEOPLE = ['april', 'allie', 'kevin']
if (!PASSWORD || PEOPLE.some((p) => !EMAILS[p])) {
  console.error('Needs FAMILY_PASSWORD and FAMILY_EMAILS (april=…,allie=…,kevin=…) in the environment.')
  process.exit(1)
}

// ---- Never print the password or an email ----

const SECRETS = [
  [PASSWORD, '[family password]'],
  ...PEOPLE.flatMap((p) => [
    [EMAILS[p], `[${p}'s email]`],
    [encodeURIComponent(EMAILS[p]), `[${p}'s email]`],
  ]),
]
function blank(text) {
  let out = String(text)
  for (const [secret, label] of SECRETS) out = out.split(secret).join(label)
  return out
}
const secretIn = (text) => SECRETS.some(([secret]) => String(text).includes(secret))
for (const method of ['log', 'error', 'warn', 'info']) {
  const original = console[method].bind(console)
  console[method] = (...args) => original(...args.map((a) => blank(a instanceof Error ? a.stack ?? a.message : typeof a === 'object' ? JSON.stringify(a) : a)))
}

// ---- Signing in ----

const tokens = {}
async function tokenOf(personId) {
  const saved = tokens[personId]
  // Sign-ins last an hour; get a fresh one well before that.
  if (saved && Date.now() - saved.at < 40 * 60 * 1000) return saved.token
  const token = await A.signInToken(EMAILS[personId], PASSWORD)
  tokens[personId] = { token, at: Date.now() }
  return token
}

async function must(url, options) {
  const r = await A.call(url, options)
  if (!r.ok) throw new Error(`${options?.method ?? 'GET'} ${url.split('?')[0]}: ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`)
  return r.json
}

// ---- Reading, as the three together ----

const record = (d) => ({
  id: decodeURIComponent(d.name.split('/').pop()),
  updateTime: d.updateTime,
  data: Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, A.plain(v)])),
})

async function listAll(name, personId) {
  const out = []
  let pageToken = ''
  do {
    const j = await must(`${A.DB}/${name}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`, { auth: await tokenOf(personId) })
    out.push(...(j.documents ?? []).map(record))
    pageToken = j.nextPageToken ?? ''
  } while (pageToken)
  return out
}

// Everything in a collection that isn't about `personId`.
async function notAbout(name, field, personId) {
  const body = { structuredQuery: { from: [{ collectionId: name }], where: { fieldFilter: { field: { fieldPath: field }, op: 'NOT_EQUAL', value: { stringValue: personId } } } } }
  const rows = await must(`${A.DB}:runQuery`, { method: 'POST', auth: await tokenOf(personId), body })
  return rows.filter((r) => r.document).map((r) => record(r.document))
}

async function list(name) {
  if (name === 'gifts' || name === 'ideas') {
    const field = name === 'gifts' ? 'recipientId' : 'aboutId'
    const byId = new Map()
    for (const p of PEOPLE) for (const r of await notAbout(name, field, p)) byId.set(r.id, r)
    return [...byId.values()]
  }
  if (name === 'members') throw new Error("the members list can't be read without admin access")
  return listAll(name, 'april')
}

const COLLECTIONS = ['people', 'homes', 'wishes', 'gifts', 'ideas']

async function snapshot() {
  const snap = { members: [] }
  for (const name of COLLECTIONS) snap[name] = (await list(name)).sort((a, b) => a.id.localeCompare(b.id))
  return snap
}

// ---- Writing, as a person, under the rules ----

async function writeAs(personId, name, id, data) {
  return must(`${A.DB}/${name}/${encodeURIComponent(id)}`, { method: 'PATCH', auth: await tokenOf(personId), body: { fields: A.fieldsOf(data) } })
}

// Deleted by someone the rules let delete it: a wish by its owner, a gift
// or note by anyone it isn't about.
async function remove(name, r) {
  const who =
    name === 'wishes' ? PEOPLE.find((p) => p === r.data.ownerId)
    : name === 'gifts' ? PEOPLE.find((p) => p !== r.data.recipientId)
    : PEOPLE.find((p) => p !== r.data.aboutId)
  if (!who) throw new Error(`nobody signed in may delete ${name}/${r.id}`)
  return must(`${A.DB}/${name}/${encodeURIComponent(r.id)}`, { method: 'DELETE', auth: await tokenOf(who) })
}

module.exports = {
  ...A,
  FAMILY: true,
  COLLECTIONS,
  PEOPLE,
  emailOf: (p) => EMAILS[p],
  passwordOf: () => PASSWORD,
  tokenOf,
  list,
  snapshot,
  writeAs,
  remove,
  secretIn,
  // No admin access in this mode.
  putDoc: undefined,
  deleteDoc: undefined,
  findAccount: undefined,
  createAccount: undefined,
  deleteAccount: undefined,
}
