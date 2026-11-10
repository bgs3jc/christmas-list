// Picks the database: Firebase once real sign-in is switched on (or when
// testing against Firebase's local emulator), browser storage before that.

import { features } from '../config/features'
import { createFirebaseStore } from './firebase-store'
import { createLocalStore } from './local-store'

const useFirebase = features.realSignIn || import.meta.env.VITE_FIREBASE_EMULATORS === 'true'

const firebase = useFirebase ? createFirebaseStore() : null
const local = useFirebase ? null : createLocalStore()

export const backend = firebase?.backend ?? local!.backend

// The prototype's "Viewing as" bar and sample data. Not there with real sign-in.
export const prototype = local && { viewAs: local.setViewerId, resetSampleData: local.resetData }

const noFirebase = () => Promise.reject(new Error('Real sign-in is switched off'))

export const signIn = {
  withGoogle: firebase?.signInWithGoogle ?? noFirebase,
  withPassword: firebase?.signInWithPassword ?? noFirebase,
  signOut: firebase?.signOut ?? noFirebase,
}
