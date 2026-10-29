import { statusLabels, type RowStatus } from './format'
import styles from './StatusPill.module.css'

export type { RowStatus }

// A small pill: dashed circle = still needs someone, full circle = covered.
// Shape and word always travel with the color.
export function StatusPill({ status }: { status: RowStatus }) {
  return (
    <span className={`${styles.pill} ${styles[status]}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle
          cx="5"
          cy="5"
          r="4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray={status === 'open' ? '2 1.6' : undefined}
          fill={status === 'covered' ? 'currentColor' : 'none'}
        />
      </svg>
      {statusLabels[status]}
    </span>
  )
}
