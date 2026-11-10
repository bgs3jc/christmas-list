// Admin access to the database and sign-in accounts, for tests/live-site.e2e.cjs.
// Admin calls skip the database rules. Nothing here runs on the site.
//
// TARGET=live: the real Firebase project, as whoever ran `gcloud auth login`
//   (must be the project's owner, on a computer where gcloud works normally).
// TARGET=live-family: the real project with no admin access; see family.cjs,
//   which uses this file's addresses and helpers but none of its admin calls.
// Otherwise: Firebase's local emulator (npm run dev:emulators), as its owner.

const { execSync } = require('child_process')
const crypto = require('crypto')

const LIVE = process.env.TARGET === 'live' || process.env.TARGET === 'live-family'
const PROJECT = LIVE ? 'family-christmas-d65ce' : 'demo-family-christmas'
const API_KEY = 'AIzaSyAbM_fXWHKdcf7PKUvB5Tt3L4f45Uewos4' // public web key, same as the site's
const SITE = LIVE ? 'https://bgs3jc.github.io/christmas-list/' : 'http://localhost:5173/christmas-list/'
const FIRESTORE = LIVE ? 'https://firestore.googleapis.com' : 'http://127.0.0.1:8080'
const AUTH = LIVE ? 'https://identitytoolkit.googleapis.com' : 'http://127.0.0.1:9099/identitytoolkit.googleapis.com'
const DB = `${FIRESTORE}/v1/projects/${PROJECT}/databases/(default)/documents`
const COLLECTIONS = ['members', 'people', 'homes', 'wishes', 'gifts', 'ideas']

// Everything the test makes starts with this, so cleanup can't touch anything else.
const MARK = 'TEST M5'
// Made-up addresses: example.com never receives mail.
const TEST_PEOPLE = ['brady', 'april', 'allie', 'kevin']
const testEmail = (personId) => `m5-test-${personId}@example.com`
// A new random password each run: nobody can borrow a test account (which is
// on the family list while the test runs) from reading this code.
const TEST_PASSWORD = `m5-${crypto.randomBytes(18).toString('base64url')}`

let token = null
function adminToken() {
  if (!LIVE) return 'owner'
  if (!token) token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim()
  return token
}

async function call(url, { method = 'GET', body, auth = 'admin' } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth === 'admin') {
    headers.Authorization = `Bearer ${adminToken()}`
    if (LIVE) headers['x-goog-user-project'] = PROJECT
  } else if (auth) {
    headers.Authorization = `Bearer ${auth}` // a person's sign-in
  }
  const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await r.text()
  const json = text ? JSON.parse(text) : {}
  return { ok: r.ok, status: r.status, json }
}

async function must(url, options) {
  const r = await call(url, options)
  if (!r.ok) throw new Error(`${options?.method ?? 'GET'} ${url.split('?')[0]}: ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`)
  return r.json
}

// ---- Firestore values <-> plain values ----

function plain(value) {
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return value.doubleValue
  if ('nullValue' in value) return null
  if ('timestampValue' in value) return value.timestampValue
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([k, v]) => [k, plain(v)]))
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(plain)
  return value
}

function firestoreValue(v) {
  if (typeof v === 'string') return { stringValue: v }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  throw new Error(`can't store ${typeof v}`)
}
const fieldsOf = (record) => Object.fromEntries(Object.entries(record).map(([k, v]) => [k, firestoreValue(v)]))

// ---- The database, as the owner ----

async function list(name) {
  const out = []
  let pageToken = ''
  do {
    const j = await must(`${DB}/${name}?pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`)
    for (const d of j.documents ?? []) {
      out.push({ id: decodeURIComponent(d.name.split('/').pop()), updateTime: d.updateTime, data: Object.fromEntries(Object.entries(d.fields ?? {}).map(([k, v]) => [k, plain(v)])) })
    }
    pageToken = j.nextPageToken ?? ''
  } while (pageToken)
  return out
}

async function snapshot() {
  const snap = {}
  for (const name of COLLECTIONS) snap[name] = (await list(name)).sort((a, b) => a.id.localeCompare(b.id))
  return snap
}

// A short code per collection: the same records with the same contents and
// change times give the same code. Shows "nothing changed" without showing what's there.
function fingerprint(records) {
  return crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex').slice(0, 12)
}

async function putDoc(name, id, record) {
  return must(`${DB}/${name}/${encodeURIComponent(id)}`, { method: 'PATCH', body: { fields: fieldsOf(record) } })
}

async function deleteDoc(name, id) {
  return must(`${DB}/${name}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ---- Rules ----

async function liveRules() {
  if (!LIVE) throw new Error('rules are only read from the live project')
  const release = await must(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}/releases/cloud.firestore`)
  const ruleset = await must(`https://firebaserules.googleapis.com/v1/${release.rulesetName}`)
  return { rulesetName: release.rulesetName, content: ruleset.source.files.map((f) => f.content).join('\n') }
}

async function publishRules(content) {
  if (!LIVE) throw new Error('rules are only published to the live project')
  const ruleset = await must(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}/rulesets`, {
    method: 'POST',
    body: { source: { files: [{ name: 'firestore.rules', content }] } },
  })
  await pointRulesAt(ruleset.name)
  return ruleset.name
}

async function pointRulesAt(rulesetName) {
  const name = `projects/${PROJECT}/releases/cloud.firestore`
  return must(`https://firebaserules.googleapis.com/v1/${name}`, { method: 'PATCH', body: { release: { name, rulesetName } } })
}

// ---- Sign-in accounts ----

const IDT = `${AUTH}/v1/projects/${PROJECT}`

async function findAccount(email) {
  const j = await must(`${IDT}/accounts:lookup`, { method: 'POST', body: { email: [email] } })
  return j.users?.[0] ?? null
}

// The way family accounts are made: Firebase's public sign-up, so it's an
// email + password account whose email is unverified, like the real ones.
async function createAccount(email) {
  const j = await must(`${AUTH}/v1/accounts:signUp?key=${API_KEY}`, { method: 'POST', auth: null, body: { email, password: TEST_PASSWORD } })
  return j.localId
}

async function deleteAccount(localId) {
  return must(`${IDT}/accounts:delete`, { method: 'POST', body: { localId } })
}

// A person's own sign-in token (what the site holds once they're signed in),
// for asking the database things directly, under the rules.
async function signInToken(email, password) {
  const j = await must(`${AUTH}/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    auth: null,
    body: { email, password, returnSecureToken: true },
  })
  return j.idToken
}

// ---- What the site test asks for, by person ----
// (family.cjs answers the same questions without admin access.)

const FAMILY = false
const PEOPLE = TEST_PEOPLE // who the test signs in as
const emailOf = testEmail
const passwordOf = () => TEST_PASSWORD
const tokenOf = (personId) => signInToken(testEmail(personId), TEST_PASSWORD)
const remove = (name, record) => deleteDoc(name, record.id)

// Writes a record as that person, under the rules, like the site would.
async function writeAs(personId, name, id, record) {
  return must(`${DB}/${name}/${encodeURIComponent(id)}`, { method: 'PATCH', auth: await tokenOf(personId), body: { fields: fieldsOf(record) } })
}

module.exports = {
  LIVE, FAMILY, API_KEY, AUTH, PROJECT, SITE, DB, COLLECTIONS, MARK, TEST_PEOPLE, testEmail,
  call, must, plain, list, snapshot, fingerprint, putDoc, deleteDoc, fieldsOf,
  liveRules, publishRules, pointRulesAt,
  findAccount, createAccount, deleteAccount, signInToken,
  PEOPLE, emailOf, passwordOf, tokenOf, writeAs, remove,
  secretIn: () => false,
}
