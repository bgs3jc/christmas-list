import type { GiftStatus } from '../data'
import { statusLabels } from './format'
import styles from './StatusMark.module.css'

// Planned is an empty circle, bought a full one, wrapped a little present.
// Shape and word always travel together, so color is never the only clue.
export function StatusMark({ status }: { status: GiftStatus }) {
  return (
    <span className={`${styles.mark} ${styles[status]}`}>
      {status === 'wrapped' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <rect x="2" y="6" width="12" height="8" rx="1" />
          <path d="M1.5 4h13v2h-13zM8 4v10M8 4C7 1 4 1 4 3c0 1 2 1 4 1zM8 4c1-3 4-3 4-1 0 1-2 1-4 1z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.6" fill={status === 'bought' ? 'currentColor' : 'none'} />
        </svg>
      )}
      {statusLabels[status]}
    </span>
  )
}
