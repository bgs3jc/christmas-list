import type { GiftStatus } from '../data'
import { statusLabels } from './format'
import styles from './StatusPill.module.css'

export type RowStatus = GiftStatus | 'open'

// A small pill: dashed circle = open, empty circle = planned, full circle =
// bought, present = wrapped. Shape and word always travel with the color.
export function StatusPill({ status }: { status: RowStatus }) {
  return (
    <span className={`${styles.pill} ${styles[status]}`}>
      {status === 'wrapped' ? (
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <rect x="2" y="6" width="12" height="8" rx="1" />
          <path d="M1.5 4h13v2h-13zM8 4v10" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <circle
            cx="5"
            cy="5"
            r="4"
            stroke="currentColor"
            strokeWidth={status === 'planned' ? 1.6 : 1.4}
            strokeDasharray={status === 'open' ? '2 1.6' : undefined}
            fill={status === 'bought' ? 'currentColor' : 'none'}
          />
        </svg>
      )}
      {statusLabels[status]}
    </span>
  )
}
