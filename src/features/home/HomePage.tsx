import { useOtherPeople, useViewer } from '../../data'
import { plural } from '../../shared/format'
import { links, type Route } from '../../shared/router'
import { SiteHeader } from '../../shared/SiteHeader'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { NightSky } from './NightSky'
import styles from './Home.module.css'

function sleepsUntilChristmas(today: Date): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let christmas = new Date(today.getFullYear(), 11, 25)
  if (start > christmas) christmas = new Date(today.getFullYear() + 1, 11, 25)
  return Math.round((christmas.getTime() - start.getTime()) / 86_400_000)
}

export function HomePage({ route }: { route: Route }) {
  const viewer = useViewer()
  const people = useOtherPeople()
  const sleeps = sleepsUntilChristmas(new Date())

  return (
    <>
      <div className={styles.night}>
        <NightSky />
        <SiteHeader route={route} tone="night" />
        <div className={styles.hero}>
          <h1 className={styles.title}>{sleeps === 0 ? "It's Christmas morning" : `${plural(sleeps, 'sleep')} until Christmas morning`}</h1>
          <p className={styles.subtitle}>Hi {viewer.name}. Santa's making his list.</p>
          <div className={styles.heroActions}>
            <a href={links.myList} className={styles.addButton}>
              Add to my list
            </a>
            <a href={links.myList} className={styles.seeButton}>
              See my list
            </a>
          </div>
        </div>
      </div>

      <main className={styles.snow}>
        <div className={styles.page}>
          <h2 className={styles.shoppingFor}>Who are you shopping for?</h2>
          <ul className={styles.people}>
            {people.map((person) => (
              <li key={person.id}>
                <a href={links.shop(person.id)} className={styles.personLink}>
                  <SnowGlobe size={170} />
                  <span className={styles.personName}>{person.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
