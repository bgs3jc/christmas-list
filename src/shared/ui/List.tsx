import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
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
  // Kept to one line; the full name shows on hover.
  title: ReactNode
  fullTitle: string
  // Right column: who's getting it, or one action.
  aside?: ReactNode
  // Shown when the row is opened. Leave out for rows that don't open.
  details?: ReactNode
  // Just added: scrolled into view and lit up for a moment.
  highlight?: boolean
}

// One line per thing. Click it to see the rest.
export function Row({ status, title, fullTitle, aside, details, highlight }: RowProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!highlight) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' })
  }, [highlight])

  const detailsId = useId()
  const toggle = () => setOpen((o) => !o)
  const lineClasses = [styles.line, status ? undefined : styles.noStatus, details ? styles.opens : undefined]
    .filter(Boolean)
    .join(' ')

  return (
    <li ref={ref} className={[styles.row, open && styles.isOpen, highlight && styles.isNew].filter(Boolean).join(' ')}>
      {/* Clicking anywhere on the line opens it; the name is the real button for keyboards. */}
      <div className={lineClasses} onClick={details ? toggle : undefined}>
        {status && <span className={styles.status}>{status}</span>}
        {details ? (
          <button
            type="button"
            className={styles.title}
            title={fullTitle}
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={(event) => {
              event.stopPropagation()
              toggle()
            }}
          >
            {title}
          </button>
        ) : (
          <span className={styles.title} title={fullTitle}>
            {title}
          </span>
        )}
        <span className={styles.aside} onClick={(event) => event.stopPropagation()}>
          {aside}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          {details && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
          )}
        </span>
      </div>
      {open && details && (
        <div id={detailsId} className={status ? styles.details : `${styles.details} ${styles.detailsNoStatus}`}>
          {details}
        </div>
      )}
    </li>
  )
}

// A quiet word after a name, like "· idea" or "· stocking".
export function TitleNote({ children }: { children: ReactNode }) {
  return <span className={styles.titleNote}> · {children}</span>
}

interface DetailsProps {
  items: { label: string; value: ReactNode }[]
  actions?: ReactNode
  children?: ReactNode
}

// The opened part of a row: label and value pairs, then actions.
export function Details({ items, actions, children }: DetailsProps) {
  const shown = items.filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
  return (
    <>
      {shown.length > 0 && (
        <dl className={styles.detailGrid}>
          {shown.map((item) => (
            <div key={item.label} className={styles.detailPair}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
      {actions && <div className={styles.detailActions}>{actions}</div>}
    </>
  )
}
