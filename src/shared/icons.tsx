// Small line icons. They take the text color unless noted.

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 3l12 12M15 3L3 15" />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

const STAR = 'M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L2.9 9.4l6.3-.9z'

// Gold when filled; a faint outline when not.
export function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={STAR}
        strokeWidth="1.6"
        strokeLinejoin="round"
        style={filled ? { fill: 'var(--gold)', stroke: 'var(--gold-deep)' } : { fill: 'none', stroke: 'var(--ink-faint)' }}
      />
    </svg>
  )
}

// A wrapped present, for "Gimme, gimme, gimme".
export function PresentIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 52 52" aria-hidden="true">
      <rect x="8" y="21" width="36" height="25" rx="3" style={{ fill: 'var(--plaid-red)' }} />
      <rect x="5" y="14" width="42" height="9" rx="2" style={{ fill: 'var(--plaid-red)' }} />
      <path d="M26 14v32" strokeWidth="5" style={{ stroke: 'var(--gold)' }} />
      <path d="M26 14c-3-9-14-9-12-2 1 3 8 2 12 2zM26 14c3-9 14-9 12-2-1 3-8 2-12 2z" style={{ fill: 'var(--gold)' }} />
    </svg>
  )
}

// A dotted outline with a question mark, for "Maybe an idea…".
export function MaybePresentIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 52 52" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3">
      <rect x="8" y="21" width="36" height="25" rx="3" />
      <rect x="5" y="14" width="42" height="9" rx="2" />
      <text x="26" y="41" textAnchor="middle" stroke="none" fontFamily="Gloock, Georgia, serif" fontSize="18" style={{ fill: 'var(--plaid-red)' }}>
        ?
      </text>
    </svg>
  )
}

// A delivery truck, for gifts on their way somewhere.
export function TruckIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 24 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M1 3h13v11H1zM14 7h5l4 4v3h-9z" />
      <circle cx="5" cy="16" r="2.2" style={{ fill: 'var(--paper)' }} />
      <circle cx="18" cy="16" r="2.2" style={{ fill: 'var(--paper)' }} />
    </svg>
  )
}
