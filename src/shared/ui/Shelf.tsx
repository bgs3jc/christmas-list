import type { ReactNode } from 'react'
import styles from './Shelf.module.css'

interface ShelfProps {
  // The person's snow globe first, then a few words about the page.
  aside: ReactNode
  // Shopping pages: the globe stays in view while you scroll, so gifts can be
  // seen landing in it. On narrow screens it becomes a slim bar at the top.
  follow?: boolean
  children: ReactNode
}

// A page with the snow globe on a shelf beside the list.
export function Shelf({ aside, follow = false, children }: ShelfProps) {
  return (
    <main className={styles.shelf}>
      <aside className={follow ? `${styles.aside} ${styles.follow}` : styles.aside}>{aside}</aside>
      <div className={styles.content}>{children}</div>
    </main>
  )
}
