import { useId, type ReactNode } from 'react'
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
  // How many gifts are planned for this person. Shoppers see them pile up.
  gifts?: number
  label?: string
  // A personal scene (pets and so on) to show instead of the tree, drawn in
  // the same 220 x 260 space. It will come from the database, never from this
  // public code.
  scene?: ReactNode
}

// The one festive moment on each page, drawn in the house print's flat inks.
export function SnowGlobe({ size = 220, gifts, label, scene }: SnowGlobeProps) {
  const clipId = `globe${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const pile = SLOTS.slice(0, gifts ?? 0)

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
      <path d="M28 252 Q110 238 192 252 Q110 262 28 252 Z" className={styles.shadow} />
      <g clipPath={`url(#${clipId})`}>
        {scene ?? <DuskScene />}
        {pile.map((slot, i) => (
          <Present key={i} index={i} {...slot} />
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
      <path d="M44 74 A72 72 0 0 1 98 28 L101 37 A63 63 0 0 0 54 78 Z" className={styles.glare} />
      <path d="M34 192h152l14 56H20z" className={styles.base} />
      <path d="M118 192h68l14 56h-74z" className={styles.baseShade} />
      <path d="M34 192h152l3 10H31z" className={styles.baseTop} />
      <rect x="70" y="214" width="80" height="20" className={styles.plate} />
      <rect x="118" y="214" width="32" height="20" className={styles.plateShade} />
    </svg>
  )
}

// The default scene: the print's dusk, a tree in the snow, its lights on.
function DuskScene() {
  return (
    <>
      <rect x="0" y="0" width="220" height="220" className={styles.sky} />
      <path d="M0 116 L220 100 V124 L0 140 Z" className={styles.bandViolet} />
      <path d="M0 140 L220 124 V142 L0 158 Z" className={styles.bandMagenta} />
      <path d="M0 158 L220 142 V166 L0 174 Z" className={styles.bandOrange} />
      <path d="M0 176 V160 q8-14 18-4 q6-12 16-2 q8-10 16 2 L60 164 L160 160 q8-14 18-2 q8-12 18 0 q8-8 24 2 V176 Z" className={styles.treeline} />
      <path d="M0 170 Q110 152 220 170 V260 H0 Z" className={styles.ground} />
      <path d="M14 186 Q80 172 132 180 T214 178 V190 Q146 198 84 192 T14 198 Z" className={styles.groundShade} />
      <path d="M116 156 L168 166 L154 171 L112 163 Z" className={styles.groundShade} />
      <path d="M110 58 L130 92 H90 Z M110 76 L136 116 H84 Z M110 96 L142 142 H78 Z" className={styles.tree} />
      <rect x="105" y="142" width="10" height="14" className={styles.trunk} />
      <path d="M90 92 Q100 86 110 90 T130 92 Q120 89 110 94 T90 92 Z M84 116 Q97 109 110 114 T136 116 Q123 112 110 118 T84 116 Z M78 142 Q94 134 110 139 T142 142 Q126 137 110 144 T78 142 Z" className={styles.treeSnow} />
      <g className={styles.lights}>
        <circle cx="102" cy="88" r="2.2" />
        <circle cx="120" cy="104" r="2.2" />
        <circle cx="96" cy="112" r="2.2" />
        <circle cx="126" cy="132" r="2.2" />
        <circle cx="104" cy="134" r="2.2" />
      </g>
      <path d="M110 44l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" className={styles.star} />
    </>
  )
}

interface PresentProps {
  index: number
  x: number
  y: number
  w: number
  h: number
}

// A wrapped present with a bow, red and green in turn.
function Present({ index, x, y, w, h }: PresentProps) {
  const mid = x + w / 2
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1" className={index % 2 ? styles.wrappedGreen : styles.wrappedRed} />
      <path d={`M${mid} ${y}v${h}M${x} ${y + h / 2}h${w}`} className={styles.ribbon} />
      <path d={`M${mid} ${y}q-4-5-6-1q3 2 6 1q4-5 6-1q-3 2-6 1z`} className={styles.bow} />
    </g>
  )
}
