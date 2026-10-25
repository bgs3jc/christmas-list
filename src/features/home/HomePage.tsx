import { useHomeSummary, useViewer } from '../../data'
import { plural } from '../../shared/format'
import { links } from '../../shared/router'
import { SnowGlobe } from '../../shared/SnowGlobe'
import styles from './Home.module.css'

function sleepsUntilChristmas(today: Date): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let christmas = new Date(today.getFullYear(), 11, 25)
  if (start > christmas) christmas = new Date(today.getFullYear() + 1, 11, 25)
  return Math.round((christmas.getTime() - start.getTime()) / 86_400_000)
}

export function HomePage() {
  const viewer = useViewer()
  const people = useHomeSummary()
  const sleeps = sleepsUntilChristmas(new Date())

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{sleeps === 0 ? "It's Christmas morning" : `${plural(sleeps, 'sleep')} until Christmas morning`}</h1>
        <p className={styles.subtitle}>Hi {viewer.name}. Who are you shopping for?</p>
      </div>

      <ul className={styles.people}>
        {people.map(({ person, openCount, giftStatuses }) => (
          <li key={person.id} className={styles.person}>
            <a href={links.shop(person.id)} className={styles.personLink}>
              <SnowGlobe size={180} gifts={giftStatuses} />
              <span className={styles.personName}>{person.name}</span>
              <span className={styles.personDetails}>
                {openCount ? `${openCount} still open` : 'All spoken for'} · {plural(giftStatuses.length, 'gift')}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className={styles.own}>
        <a href={links.myList}>Add to your own list</a>
      </p>
    </main>
  )
}
