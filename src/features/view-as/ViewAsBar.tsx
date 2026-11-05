import { prototype, usePeople, useViewer } from '../../data'
import styles from './ViewAsBar.module.css'

// Prototype only: pretend to be anyone. Gone once real sign-in is on.
export function ViewAsBar() {
  const viewer = useViewer()
  const people = usePeople()
  if (!prototype) return null
  const { viewAs, resetSampleData } = prototype

  function reset() {
    if (window.confirm('Put back the sample data? Anything you added will be lost.')) resetSampleData()
  }

  return (
    <div className={styles.bar}>
      <span className={styles.tag}>Prototype</span>
      <label htmlFor="view-as" className={styles.label}>
        Viewing as
      </label>
      <select id="view-as" className={styles.select} value={viewer.id} onChange={(e) => viewAs(e.target.value)}>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <span className={styles.hint}>Open a second tab as someone else to watch changes appear.</span>
      <button type="button" className={styles.reset} onClick={reset}>
        Reset sample data
      </button>
    </div>
  )
}
