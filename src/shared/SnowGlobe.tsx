import { useId } from 'react'
import type { GiftStatus } from '../data'
import styles from './SnowGlobe.module.css'

// Spots for gifts at the bottom of the globe, front row first. Nine fit.
const SLOTS = [
  { x: 96, y: 170, w: 18, h: 13 },
  { x: 116, y: 171, w: 16, h: 12 },
  { x: 78, y: 171, w: 16, h: 12 },
  { x: 134, y: 170, w: 18, h: 13 },
  { x: 60, y: 171, w: 16, h: 12 },
  { x: 84, y: 158, w: 14, h: 12 },
  { x: 122, y: 158, w: 14, h: 12 },
  { x: 67, y: 159, w: 14, h: 11 },
  { x: 139, y: 158, w: 15, h: 12 },
]

interface SnowGlobeProps {
  size?: number
  // Shoppers see the gifts piling up. Leave this out on someone's own page.
  gifts?: GiftStatus[]
  label?: string
}

// The one festive moment on each page. Personal scenes (pets and so on) come
// later from the database, not from this public code.
export function SnowGlobe({ size = 220, gifts, label }: SnowGlobeProps) {
  const clipId = `globe${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const pile = (gifts ?? []).slice(0, SLOTS.length)

  return (
    <svg
      viewBox="0 0 220 260"
      width={size}
      height={(size * 260) / 220}
      className={styles.globe}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="110" cy="108" r="92" />
        </clipPath>
      </defs>
      <circle cx="110" cy="108" r="92" className={styles.glass} />
      <g clipPath={`url(#${clipId})`}>
        <ellipse cx="110" cy="196" rx="120" ry="40" className={styles.ground} />
        <path d="M110 64l22 34h-12l18 26h-14l16 26h-60l16-26h-14l18-26h-12z" className={styles.tree} />
        <rect x="104" y="150" width="12" height="9" className={styles.trunk} />
        <path d="M110 54l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" className={styles.star} />
        {pile.map((status, i) => (
          <Present key={i} status={status} index={i} {...SLOTS[i]} />
        ))}
        <g className={styles.snow}>
          <circle cx="40" cy="40" r="2.5" />
          <circle cx="78" cy="22" r="2" />
          <circle cx="142" cy="40" r="2.5" />
          <circle cx="180" cy="30" r="2" />
          <circle cx="60" cy="74" r="2" />
          <circle cx="168" cy="82" r="1.8" />
        </g>
      </g>
      <path d="M52 52a80 80 0 0 1 60-30" className={styles.glare} />
      <path d="M34 192h152l14 56H20z" className={styles.base} />
      <path d="M34 192h152l3 10H31z" className={styles.baseTop} />
      <rect x="70" y="214" width="80" height="20" rx="3" className={styles.plate} />
    </svg>
  )
}

interface PresentProps {
  status: GiftStatus
  index: number
  x: number
  y: number
  w: number
  h: number
}

// Wrapped gifts get paper and a bow, bought ones are plain boxes, planned ones dotted outlines.
function Present({ status, index, x, y, w, h }: PresentProps) {
  if (status === 'planned') {
    return <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx="1" className={styles.planned} />
  }
  if (status === 'bought') {
    return <rect x={x} y={y} width={w} height={h} rx="1" className={styles.bought} />
  }
  const mid = x + w / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1" className={index % 2 ? styles.wrappedGreen : styles.wrappedRed} />
      <path d={`M${mid} ${y}v${h}M${x} ${y + h / 2}h${w}`} className={styles.ribbon} />
      <path d={`M${mid} ${y}q-4-5-6-1q3 2 6 1q4-5 6-1q-3 2-6 1z`} className={styles.bow} />
    </g>
  )
}
