import styles from './SantasSack.module.css'

// Santa's sack, full of presents, in the house print's flat inks. Approved
// as drawn in docs/design/santas-sack.svg: every shape is kept exactly; only
// the colors come from the theme. It sits beside the page's heading, which
// says the same thing, so screen readers skip it.
export function SantasSack({ size = 260 }: { size?: number }) {
  return (
    <svg viewBox="0 0 220 250" width={size} height={(size * 250) / 220} className={styles.sack} aria-hidden="true">
      <path d="M16 237 Q110 221 204 237 Q110 250 16 237 Z" className={styles.shadow} />
      {/* Presents */}
      <rect x="52" y="58" width="44" height="56" className={styles.gold} />
      <rect x="83" y="58" width="13" height="56" className={styles.goldDeep} />
      <rect x="64" y="58" width="9" height="56" className={styles.orange} />
      <path d="M68 58c-4-12-18-11-15-3 2 4 10 3 15 3zM69 58c4-12 18-11 15-3-2 4-10 3-15 3z" className={styles.orange} />
      <rect x="94" y="28" width="48" height="86" className={styles.blue} />
      <rect x="127" y="28" width="15" height="86" className={styles.blueDeep} />
      <rect x="107" y="28" width="10" height="86" className={styles.cream} />
      <path d="M91 29q0-7 8-7h38q8 0 8 7v4q-7 6-13.5 0-6.500 6-13.500 0-6.500 6-13.500 0-6.500 5-13.500 0z" className={styles.cream} />
      <rect x="140" y="70" width="30" height="44" className={styles.pine} />
      <rect x="161" y="70" width="9" height="44" className={styles.pineDeep} />
      <rect x="148" y="70" width="7" height="44" className={styles.gold} />
      <path d="M138 71q0-6 6-6h22q6 0 6 6v3q-5.500 5-11.500 0-5.500 5-11 0-5.500 5-11.500 0z" className={styles.cream} />
      {/* The sack: narrow at the neck, slumped wide at the bottom */}
      <path d="M50 112 C40 136 8 168 16 206 C20 226 34 233 52 233 H170 C188 233 201 225 205 206 C212 168 180 136 170 112 Z" className={styles.sackRed} />
      <path d="M50 112 C40 136 8 168 16 206 C20 226 34 233 52 233 H66 C34 214 40 160 70 112 Z" className={styles.sackLight} />
      <path d="M142 112 H170 C180 136 212 168 205 206 C201 225 188 233 170 233 H150 C186 208 172 150 142 112 Z" className={styles.ink} />
      <path d="M100 124 C94 150 104 170 94 198 C111 172 107 148 109 124 Z" className={styles.ink} />
      {/* A soft cuff, like snow on the print's bushes */}
      <path d="M42 100 H178 q8 0 8 8 v8 q-9.500 9 -19 0 q-9.500 9 -19 0 q-9.500 9 -19 0 q-9.500 9 -19 0 q-9.500 9 -19 0 q-9.500 9 -19 0 q-9.500 9 -19 0 q-9.500 9 -19 0 v-8 q0 -8 8 -8 z" className={styles.cream} />
      <path d="M148 100 H178 q8 0 8 8 v8 q-9.500 9 -19 0 q-9.500 9 -19 0 z" className={styles.snowShadow} />
      {/* A gift tag on a gold string */}
      <path d="M62 122 C52 138 36 152 40 170" className={styles.string} />
      <path d="M27 172 l15 -9 l23 31 l-19 15 z" className={styles.pine} />
      <circle cx="41" cy="174" r="3.2" className={styles.cream} />
    </svg>
  )
}
