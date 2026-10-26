import styles from './Home.module.css'

// The home page sky: stars, a moon, Santa's sleigh crossing slowly, and snowy
// hills at the bottom. Purely decoration.
export function NightSky() {
  return (
    <svg className={styles.sky} viewBox="0 0 1280 470" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <symbol id="reindeer" viewBox="0 0 44 30">
          <ellipse cx="20" cy="15" rx="12" ry="5" />
          <path d="M29 13 L35 6 L38 8 L32 16 Z" />
          <ellipse cx="38" cy="6" rx="4.5" ry="2.6" />
          <path d="M36 4 L34 0 M35 2 L32 1.5 M38 3.5 L38.5 0" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M12 18 L6 26 M15 19 L18 28 M26 19 L23 27 M28 18 L35 25 M8 13 L3 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </symbol>
      </defs>
      <g className={styles.stars}>
        {[
          [80, 120, 1.5], [190, 210, 1], [330, 100, 1.8], [470, 180, 1], [560, 90, 1.3], [760, 230, 1], [840, 120, 1.6],
          [1000, 250, 1], [1210, 180, 1.4], [660, 300, 1], [260, 300, 1.2], [1130, 300, 1], [420, 260, 1.1], [930, 160, 1.2],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <path d="M1112 108a46 46 0 1 0 50 64a38 38 0 1 1-50-64z" className={styles.moon} />
      <g className={styles.sleigh}>
        <g transform="translate(0 92)">
          <path d="M0 40 q10 14 34 12 h44 q10 0 14-10" className={styles.runner} />
          <path d="M14 22 h58 l-6 20 h-46 z" />
          <circle cx="40" cy="10" r="7" className={styles.santaFace} />
          <path d="M30 22 q10-14 22 0 z M33 6 q7-9 14 0 z" className={styles.santaRed} />
          <path d="M60 18 q8-12 14 2" className={styles.sack} />
          <path d="M92 30 L330 20" className={styles.reins} />
          {[
            [110, 12], [160, 8], [210, 10], [260, 6], [310, 2],
          ].map(([x, y]) => (
            <use key={x} href="#reindeer" x={x} y={y} width="44" height="30" />
          ))}
          <circle cx="353" cy="10" r="3.2" className={styles.nose} />
          <circle cx="353" cy="10" r="7" className={styles.noseGlow} />
        </g>
      </g>
      <path d="M0 420 Q 220 370 480 400 T 960 390 T 1280 380 V470 H0 Z" className={styles.hillBack} />
      <path d="M0 448 Q 300 410 640 440 T 1280 430 V470 H0 Z" className={styles.hillFront} />
    </svg>
  )
}
