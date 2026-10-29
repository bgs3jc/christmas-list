import { Fragment, useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './List.module.css'

// The list look, shared by every page. Restyling rows happens here and in
// List.module.css, in one place.

interface ListSectionProps {
  title: string
  // One button on the right of the heading, if the section needs it.
  action?: ReactNode
  children: ReactNode
}

export function ListSection({ title, action, children }: ListSectionProps) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 id={headingId} className={styles.sectionTitle}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Rows({ children }: { children: ReactNode }) {
  return <ul className={styles.rows}>{children}</ul>
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>
}

interface RowProps {
  // Left column, usually a status pill. Leave out for rows without one.
  status?: ReactNode
  title: ReactNode
  // Smaller lines under the name, always showing: notes, a link. Use NoteLine.
  notes?: ReactNode
  // Right column: who's getting it, or one or two actions.
  aside?: ReactNode
  // Things that belong to this row, such as gifts under an idea.
  children?: ReactNode
  // Just added: scrolled into view and lit up for a moment.
  highlight?: boolean
}

// One thing per row, with everything about it in view: nothing to open.
export function Row({ status, title, notes, aside, children, highlight }: RowProps) {
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!highlight) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' })
  }, [highlight])

  const classes = [styles.row, status ? undefined : styles.noStatus, highlight ? styles.isNew : undefined]
  return (
    <li ref={ref} className={classes.filter(Boolean).join(' ')}>
      {status && <div className={styles.status}>{status}</div>}
      <div className={styles.main}>
        <div className={styles.title}>{title}</div>
        {notes}
        {children}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </li>
  )
}

// A quiet word after a name, like "· idea" or "· stocking".
export function TitleNote({ children }: { children: ReactNode }) {
  return <span className={styles.titleNote}> · {children}</span>
}

// One small line under a name: its parts joined with dots, empty parts left out.
export function NoteLine({ parts }: { parts: ReactNode[] }) {
  const shown = parts.filter((part) => part !== undefined && part !== null && part !== false && part !== '')
  if (shown.length === 0) return null
  return (
    <p className={styles.note}>
      {shown.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && ' · '}
          {part}
        </Fragment>
      ))}
    </p>
  )
}
