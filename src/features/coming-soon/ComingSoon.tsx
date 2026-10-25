import styles from './ComingSoon.module.css'

// Placeholder shown while the real app is built. A gift tag hangs from a
// strip of pajama plaid and sways slowly.
export function ComingSoon() {
  return (
    <main className={styles.page}>
      <div className={styles.plaid} aria-hidden="true" />

      <div className={styles.hanger}>
        <div className={styles.string} aria-hidden="true" />
        <section className={styles.tag}>
          <p className={styles.to}>To: the whole family</p>
          <h1 className={styles.title}>Our Christmas List</h1>
          <p className={styles.note}>Still being wrapped. Check back soon.</p>
        </section>
      </div>
    </main>
  )
}
