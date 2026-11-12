import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react'
import { CloseIcon } from '../icons'
import { Button } from './Button'
import styles from './Dialog.module.css'

interface DialogProps {
  title: string
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
  footer: ReactNode
  // "Are you sure?", asked in the pop-up itself. While set, it takes the
  // place of the buttons at the bottom.
  confirm?: DialogConfirm | null
}

export interface DialogConfirm {
  // The question, e.g. 'Take "Wool socks" off your list?'
  message: string
  // The button that goes ahead, e.g. "Yes, take it off"
  yes: string
  onYes: () => void
  // "Keep it": back to the pop-up as it was
  onNo: () => void
}

// A pop-up form. It opens as soon as it's shown; the page hides it by not
// rendering it, which also clears whatever was typed.
export function Dialog({ title, onClose, onSubmit, children, footer, confirm }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    // Opening moves the cursor to the first button (the X). Put it in the
    // field that asked for it instead, so typing goes straight in.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])

  // When the question appears, the cursor goes to "Keep it", the safe answer.
  const keepRef = useRef<HTMLButtonElement>(null)
  const asking = Boolean(confirm)
  useEffect(() => {
    if (asking) keepRef.current?.focus()
  }, [asking])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // Enter in a text box shouldn't save while a question is waiting.
    if (confirm) return
    onSubmit()
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      // Closes with the X, Cancel or the Esc key, never by a click outside:
      // that loses what was typed (say, a pasted list of links).
      onClose={onClose}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {confirm ? (
          <div className={styles.footer}>
            <p className={styles.confirmMessage} role="alert">
              {confirm.message}
            </p>
            <Button ref={keepRef} onClick={confirm.onNo}>
              Keep it
            </Button>
            <Button variant="main" onClick={confirm.onYes}>
              {confirm.yes}
            </Button>
          </div>
        ) : (
          <div className={styles.footer}>{footer}</div>
        )}
      </form>
    </dialog>
  )
}
