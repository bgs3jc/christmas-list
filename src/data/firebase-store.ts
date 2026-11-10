// The real database: Firebase sign-in and Firestore.
//
// Sign-in: your email and the family password, or Google (Brady). Each
// family email has its own password account, made before its members entry,
// so nobody else can take that email. Once someone is signed in, their email is looked up in the `members` collection, which Brady
// fills in by hand in the Firebase console. That says which person they are.
// Anyone not listed there sees nothing.
//
// Reads ask only for what the viewer may see: no gifts or ideas about
// themselves. firestore.rules refuses anything else, so this is enforced by
// the server, not just this file.

import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  initializeFirestore,
  onSnapshot,
  query,
  where,
  writeBatch,
  updateDoc,
  type Query,
} from 'firebase/firestore'
import { emptyData, SignInError, type Backend, type Session, type SignInProblem, type Snapshot } from './backend'
import { firebaseConfig } from './firebase-config'
import { globeSceneUrl } from './globe-scenes'
import type { AppData, Home, Person } from './types'

export function createFirebaseStore() {
  // Set when running against Firebase's local emulator (for testing on Claude's
  // machine). A "demo-" project never touches the real one.
  const useEmulators = import.meta.env.VITE_FIREBASE_EMULATORS === 'true'

  const app = initializeApp(useEmulators ? { ...firebaseConfig, projectId: 'demo-family-christmas' } : firebaseConfig)
  const auth = getAuth(app)
  // The default in-memory cache: nothing stays on the device after the tab
  // closes, which matters on a shared computer.
  const db = initializeFirestore(app, {})
  if (useEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

  let snapshot: Snapshot = { session: { status: 'loading' }, data: emptyData, viewerId: '' }
  const listeners = new Set<() => void>()
  let stopReading: (() => void) | null = null

  function update(change: Partial<Snapshot>) {
    snapshot = { ...snapshot, ...change }
    listeners.forEach((listener) => listener())
  }

  function setSession(session: Session) {
    update({ session })
  }

  // ---- Reading the family's lists ----

  function personFrom(id: string, data: Record<string, unknown>): Person {
    return { ...(data as Omit<Person, 'id'>), id, globeScene: globeSceneUrl(data.globeScene as string | undefined) }
  }

  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

  // Starts live reads of everything this person may see. The site shows the
  // lists once every read has arrived once, so pages never see half the data.
  function startReading(viewerId: string) {
    const reads: { key: keyof AppData; query: Query; shape: (id: string, data: Record<string, unknown>) => unknown }[] = [
      { key: 'people', query: collection(db, 'people'), shape: personFrom },
      { key: 'homes', query: collection(db, 'homes'), shape: (id, data) => ({ ...data, id }) },
      { key: 'wishes', query: collection(db, 'wishes'), shape: (id, data) => ({ ...data, id }) },
      { key: 'gifts', query: query(collection(db, 'gifts'), where('recipientId', '!=', viewerId)), shape: (id, data) => ({ ...data, id }) },
      { key: 'ideas', query: query(collection(db, 'ideas'), where('aboutId', '!=', viewerId)), shape: (id, data) => ({ ...data, id }) },
    ]
    const arrived = new Set<keyof AppData>()
    let data: AppData = emptyData

    const stops = reads.map((read) =>
      onSnapshot(
        read.query,
        (result) => {
          let records = result.docs.map((d) => read.shape(d.id, d.data()))
          if (read.key === 'people') records = (records as Person[]).sort(byName)
          if (read.key === 'homes') records = (records as Home[]).sort(byName)
          data = { ...data, [read.key]: records }
          arrived.add(read.key)
          if (arrived.size === reads.length) update({ data, viewerId, session: { status: 'ready' } })
        },
        (error) => {
          // Usually means this person was taken off the family list.
          console.error(`Couldn't read ${read.key}`, error)
          setSession({ status: 'not-family', email: auth.currentUser?.email ?? '' })
        },
      ),
    )
    stopReading = () => stops.forEach((stop) => stop())
  }

  async function whoIs(user: User) {
    stopReading?.()
    stopReading = null
    update({ data: emptyData, viewerId: '', session: { status: 'loading' } })
    const email = (user.email ?? '').toLowerCase()
    try {
      const member = await getDoc(doc(db, 'members', email))
      const personId = member.data()?.personId
      if (typeof personId === 'string' && personId) startReading(personId)
      else setSession({ status: 'not-family', email })
    } catch (error) {
      console.error("Couldn't look up the family list", error)
      setSession({ status: 'not-family', email })
    }
  }

  // ---- Signing in and out ----

  // Firebase's error codes, as the sign-in page's reasons.
  function problemOf(error: unknown): SignInProblem {
    const code = (error as { code?: string }).code ?? ''
    if (code === 'auth/popup-blocked') return 'popup-blocked'
    if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email', 'auth/missing-email', 'auth/missing-password', 'auth/user-disabled'].includes(code)) return 'wrong-password'
    if (code === 'auth/too-many-requests') return 'too-many'
    return 'failed'
  }

  async function signInWithGoogle(): Promise<void> {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (error) {
      const code = (error as { code?: string }).code
      // Closing Google's window is changing your mind, not a problem.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
      console.error('Google sign-in failed', error)
      throw new SignInError(problemOf(error))
    }
  }

  async function signInWithPassword(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
    } catch (error) {
      const problem = problemOf(error)
      // A mistyped password is normal; only log the unexpected.
      if (problem === 'failed') console.error("Couldn't sign in", error)
      throw new SignInError(problem)
    }
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
  }

  // An old sign-in link from before the family password: drop its code from
  // the address bar, so it isn't bookmarked. The sign-in page shows as usual.
  if (window.location.search.includes('oobCode')) {
    window.history.replaceState(null, '', import.meta.env.BASE_URL + window.location.hash)
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      void whoIs(user)
      return
    }
    stopReading?.()
    stopReading = null
    update({ data: emptyData, viewerId: '', session: { status: 'signed-out' } })
  })

  // ---- Writing ----

  function couldNotSave(error: unknown) {
    console.error("Couldn't save", error)
    window.alert("That didn't save. Try again, and if it keeps happening, tell Brady.")
  }

  // Firestore can't store "undefined": a field set to undefined is removed instead.
  function forFirestore(fields: Record<string, unknown>, clearBlanks: boolean) {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(fields)) {
      if (key === 'id') continue
      if (value !== undefined) out[key] = value
      else if (clearBlanks) out[key] = deleteField()
    }
    return out
  }

  const backend: Backend = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    put(name, records) {
      const batch = writeBatch(db)
      records.forEach((record) => batch.set(doc(db, name, record.id), forFirestore({ ...record }, false)))
      batch.commit().catch(couldNotSave)
    },
    patch(name, id, patch) {
      updateDoc(doc(db, name, id), forFirestore({ ...patch }, true)).catch(couldNotSave)
    },
    remove(name, id) {
      deleteDoc(doc(db, name, id)).catch(couldNotSave)
    },
  }

  return { backend, signInWithGoogle, signInWithPassword, signOut }
}
