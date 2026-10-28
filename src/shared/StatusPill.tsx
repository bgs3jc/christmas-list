import { statusLabels, type RowStatus } from './format'
import styles from './StatusPill.module.css'

export type { RowStatus }

interface StatusPillProps {
  status: RowStatus
  // Given only on gifts you're getting: the pill becomes a one-tap switch
  // between "Not bought" and "Bought".
  onToggle?: () => void
}

// A small pill: dashed circle = open, empty circle = not bought, full circle =
// bought. Shape and word always travel with the color.
export function StatusPill({ status, onToggle }: StatusPillProps) {
  const content = (
    <>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle
          cx="5"
          cy="5"
          r="4"
          stroke="currentColor"
          strokeWidth={status === 'notBought' ? 1.6 : 1.4}
          strokeDasharray={status === 'open' ? '2 1.6' : undefined}
          fill={status === 'bought' ? 'currentColor' : 'none'}
        />
      </svg>
      {statusLabels[status]}
    </>
  )

  if (!onToggle) return <span className={`${styles.pill} ${styles[status]}`}>{content}</span>

  return (
    <button
      type="button"
      className={`${styles.pill} ${styles[status]} ${styles.toggle}`}
      aria-pressed={status === 'bought'}
      title={status === 'bought' ? 'Mark as not bought' : 'Mark as bought'}
      onClick={(event) => {
        // The row opens on click; the switch shouldn't.
        event.stopPropagation()
        onToggle()
      }}
    >
      {content}
    </button>
  )
}
