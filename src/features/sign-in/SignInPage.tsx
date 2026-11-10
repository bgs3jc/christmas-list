import { useState, type FormEvent, type ReactNode } from 'react'
import { signInWithGoogle, signInWithPassword, signOut, SignInError, type Session, type SignInProblem } from '../../data'
import { Button } from '../../shared/ui/Button'
import { TextField } from '../../shared/ui/Form'
import styles from './SignIn.module.css'

// A plain first version. The design round replaces the look; what it asks
// for and says stays.

const problems: Record<SignInProblem, string> = {
  'popup-blocked': 'Your browser stopped the Google window from opening. Allow pop-ups for this site, or use your email and the family password.',
  // Never says which of the two is wrong.
  'wrong-password': "That email and family password don't match. Check both and try again.",
  'too-many': 'Too many tries. Wait a few minutes and try again.',
  failed: "That didn't work. Check your connection and try again.",
}

function messageFor(error: unknown) {
  return problems[error instanceof SignInError ? error.problem : 'failed']
}

export function SignInPage({ session }: { session: Session }) {
  if (session.status === 'loading') {
    return (
      <Frame>
        <p className={styles.lead} role="status">
          Opening the list…
        </p>
      </Frame>
    )
  }
  if (session.status === 'not-family') return <NotFamily email={session.email} />
  return <SignIn />
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.sky} aria-hidden="true" />
      <div className={styles.card}>
        <p className={styles.wordmark}>The Family List</p>
        {children}
      </div>
    </main>
  )
}

function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  async function signIn(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!email.trim() || !password) return setProblem('Type your email and the family password.')
    setBusy(true)
    setProblem('')
    try {
      // Once it works, the page changes to the lists by itself.
      await signInWithPassword(email, password)
    } catch (error) {
      setProblem(messageFor(error))
      setBusy(false)
    }
  }

  async function google() {
    setProblem('')
    try {
      await signInWithGoogle()
    } catch (error) {
      setProblem(messageFor(error))
    }
  }

  return (
    <Frame>
      <h1 className={styles.title}>Sign in to see everyone's lists</h1>
      <form className={styles.form} onSubmit={signIn} noValidate>
        <TextField label="Your email" name="email" value={email} onChange={setEmail} email required />
        <TextField
          label="Family password"
          name="password"
          value={password}
          onChange={setPassword}
          password
          shown={showPassword}
          help="Ask Brady if you don't have it."
          required
        />
        <label className={styles.show}>
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
          Show password
        </label>
        <Button type="submit" variant="main">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      {problem && (
        <p className={styles.problem} role="alert">
          {problem}
        </p>
      )}
      <p className={styles.or}>or</p>
      <Button onClick={google}>Sign in with Google</Button>
    </Frame>
  )
}

function NotFamily({ email }: { email: string }) {
  return (
    <Frame>
      <h1 className={styles.title}>This list is just for the family</h1>
      <p className={styles.lead}>
        <strong>{email || 'This account'}</strong> isn't on it. If that's you, ask Brady to add this email.
      </p>
      <Button onClick={() => void signOut()}>Sign in with a different email</Button>
    </Frame>
  )
}
