import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react'
import { CloseIcon } from '../icons'
import styles from './Dialog.module.css'

interface DialogProps {
  title: string
  onClose: () => void
  onSubmit: () => void
  children: ReactNode
  footer: ReactNode
}

// A pop-up form. It opens as soon as it's shown; the page hides it by not
// rendering it, which also clears whatever was typed.
export function Dialog({ title, onClose, onSubmit, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the dimmed area outside the box closes it.
      onClick={(event) => event.target === ref.current && onClose()}
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
        <div className={styles.footer}>{footer}</div>
      </form>
    </dialog>
  )
}
