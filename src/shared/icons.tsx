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

// A wrapped present, for "Gimme, gimme, gimme", drawn flat on its red block.
export function PresentIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 52 52" aria-hidden="true">
      <rect x="8" y="21" width="36" height="25" style={{ fill: 'var(--on-ink)' }} />
      <rect x="5" y="14" width="42" height="9" style={{ fill: 'var(--on-ink)' }} />
      <path d="M26 14v32" strokeWidth="5" style={{ stroke: 'var(--globe-light)' }} />
      <path d="M26 14c-3-9-14-9-12-2 1 3 8 2 12 2zM26 14c3-9 14-9 12-2-1 3-8 2-12 2z" style={{ fill: 'var(--globe-light)' }} />
    </svg>
  )
}

// A lit lightbulb, for "An idea…", drawn flat on its cobalt block.
export function LightbulbIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 52 52" aria-hidden="true">
      <path d="M26 2v5M9 10l3.5 3.5M43 10l-3.5 3.5M3 26h5M44 26h5" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: 'var(--on-ink)' }} />
      <path
        d="M26 11c-8 0-14 6-14 13.5 0 5 2.6 8.4 5.4 11 1.6 1.5 2.6 3.4 2.6 5.5h12c0-2.1 1-4 2.6-5.5 2.8-2.6 5.4-6 5.4-11C40 17 34 11 26 11z"
        style={{ fill: 'var(--globe-light)' }}
      />
      <path d="M21 46h10M22.5 50h7" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: 'var(--globe-light)' }} />
    </svg>
  )
}

// A delivery truck, for gifts on their way somewhere.
