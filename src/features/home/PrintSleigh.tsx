import styles from './Home.module.css'

// Santa's sleigh as one flat ink, like the rest of the house print. It flies
// in a layer masked to the print's sky, so it passes behind the oak and the
// chimney. Purely decoration.
export function PrintSleigh() {
  return (
    <div className={styles.flight} aria-hidden="true">
      <svg className={styles.printSleigh} viewBox="0 0 364 56">
        <defs>
          <symbol id="printReindeer" viewBox="0 0 44 30">
            <ellipse cx="20" cy="15" rx="12" ry="5" />
            <path d="M29 13 L35 6 L38 8 L32 16 Z" />
            <ellipse cx="38" cy="6" rx="4.5" ry="2.6" />
            <path d="M36 4 L34 0 M35 2 L32 1.5 M38 3.5 L38.5 0" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <path d="M12 18 L6 26 M15 19 L18 28 M26 19 L23 27 M28 18 L35 25 M8 13 L3 10" stroke="currentColor" strokeWidth="2" fill="none" />
          </symbol>
        </defs>
        <path d="M0 40 q10 14 34 12 h44 q10 0 14-10" stroke="currentColor" strokeWidth="2.4" fill="none" />
        <path d="M14 22 h58 l-6 20 h-46 z" />
        <circle cx="40" cy="10" r="7" />
        <path d="M30 22 q10-14 22 0 z M60 18 q8-12 14 2 z" />
        {/* Santa's hat, its tip trailing back in the wind */}
        <path d="M33 6 L48 6 Q47 -3 40 -4 Q32 -4 27 2 L30 3.5 Z" className={styles.printHat} />
        <rect x="32" y="4.5" width="17" height="3.4" className={styles.printTrim} />
        <circle cx="27" cy="2.4" r="2.6" className={styles.printTrim} />
        <path d="M92 30 L330 20" stroke="currentColor" strokeWidth="1" />
        {[
          [110, 12], [160, 8], [210, 10], [260, 6], [310, 2],
        ].map(([x, y]) => (
          <use key={x} href="#printReindeer" x={x} y={y} width="44" height="30" />
        ))}
        <circle cx="353" cy="10" r="3.4" className={styles.printNose} />
      </svg>
    </div>
  )
}
