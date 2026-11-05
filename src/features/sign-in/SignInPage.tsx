import { useState, type FormEvent, type ReactNode } from 'react'
import { finishSignInLink, sendSignInLink, signInWithGoogle, signOut, SignInError, type Session, type SignInProblem } from '../../data'
import { Button } from '../../shared/ui/Button'
import { TextField } from '../../shared/ui/Form'
import styles from './SignIn.module.css'

// A plain first version. The design round replaces the look; what it asks
// for and says stays.

const problems: Record<SignInProblem, string> = {
  'popup-blocked': 'Your browser stopped the Google window from opening. Allow pop-ups for this site, or use the email link.',
  'bad-email': "That doesn't look like an email address. Check it and try again.",
  'too-many': 'Too many sign-in emails today. Try again tomorrow, or sign in with Google.',
  'link-expired': 'That link was old or already used. Send yourself a new one.',
  'wrong-email': "That's not the email the link was sent to. Try the other one.",
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
  if (session.status === 'needs-email') return <FinishLink />
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
  const [sentTo, setSentTo] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  async function emailLink(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!email.trim()) return setProblem(problems['bad-email'])
    setBusy(true)
    setProblem('')
    try {
      await sendSignInLink(email)
      setSentTo(email.trim())
    } catch (error) {
      setProblem(messageFor(error))
    } finally {
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

  if (sentTo) {
    return (
      <Frame>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.lead}>
          We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this {deviceWord()} and you're in.
        </p>
        <p className={styles.hint}>It can take a minute. If it's not there, look in Junk.</p>
        <Button variant="quiet" onClick={() => setSentTo('')}>
          Use a different email
        </Button>
      </Frame>
    )
  }

  return (
    <Frame>
      <h1 className={styles.title}>Sign in to see everyone's lists</h1>
      <form className={styles.form} onSubmit={emailLink} noValidate>
        <TextField label="Your email" value={email} onChange={setEmail} email required />
        <Button type="submit" variant="main">
          {busy ? 'Sending…' : 'Email me a sign-in link'}
        </Button>
      </form>
      <p className={styles.or}>or</p>
      <Button onClick={google}>Sign in with Google</Button>
      {problem && (
        <p className={styles.problem} role="alert">
          {problem}
        </p>
      )}
    </Frame>
  )
}

// Opened the link on a different device or browser than the one it was sent from.
function FinishLink() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')

  async function finish(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    if (!email.trim()) return setProblem(problems['bad-email'])
    setBusy(true)
    setProblem('')
    try {
      await finishSignInLink(email)
    } catch (error) {
      setProblem(messageFor(error))
      setBusy(false)
    }
  }

  return (
    <Frame>
      <h1 className={styles.title}>Almost in</h1>
      <p className={styles.lead}>Type the email the link was sent to.</p>
      <form className={styles.form} onSubmit={finish} noValidate>
        <TextField label="Your email" value={email} onChange={setEmail} email required />
        <Button type="submit" variant="main">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      {problem && (
        <p className={styles.problem} role="alert">
          {problem}
        </p>
      )}
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

function deviceWord() {
  return /iPhone|Android/i.test(navigator.userAgent) ? 'phone' : /iPad/i.test(navigator.userAgent) ? 'iPad' : 'computer'
}
