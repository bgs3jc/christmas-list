import { features } from '../../config/features'
import { DownloadLink } from '../export'
import { useOtherPeople, useViewer } from '../../data'
import { plural } from '../../shared/format'
import { links, type Route } from '../../shared/router'
import { SiteHeader } from '../../shared/SiteHeader'
import { SnowGlobe } from '../../shared/SnowGlobe'
import housePrintSmall from './house-print-768.webp'
import housePrintLarge from './house-print-1536.webp'
import housePrintSharp from './house-print-3072.webp'
import housePrintTallSmall from './house-print-tall-543.webp'
import housePrintTallLarge from './house-print-tall-1086.webp'
import housePrintTallSharp from './house-print-tall-1629.webp'
import { NightSky } from './NightSky'
import { PrintSleigh } from './PrintSleigh'
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

  const hero = (
    <div className={styles.hero}>
      <h1 className={styles.title}>{sleeps === 0 ? "It's Christmas morning" : `${plural(sleeps, 'sleep')} until Christmas morning`}</h1>
      <p className={styles.subtitle}>Hi {viewer.name}. Santa's making his list.</p>
      <div className={styles.heroActions}>
        <a href={links.myList} className={styles.addButton}>
          Add to my list
        </a>
      </div>
    </div>
  )

  return (
    <>
      {features.housePrint ? (
        // The headline sits on the picture's own sky: above it on narrower
        // screens, in its open top-right corner on wide ones.
        <div className={styles.print}>
          <div className={styles.printTop}>
            <SiteHeader route={route} tone="night" wide />
            {hero}
          </div>
          <div className={styles.scene}>
            {/* Phones get a tall version of the same print, which fits a narrow screen. */}
            <picture>
              <source media="(max-width: 640px)" srcSet={`${housePrintTallSmall} 543w, ${housePrintTallLarge} 1086w, ${housePrintTallSharp} 1629w`} sizes="100vw" />
              <img
                className={styles.printImage}
                src={housePrintLarge}
                srcSet={`${housePrintSmall} 768w, ${housePrintLarge} 1536w, ${housePrintSharp} 3072w`}
                sizes="100vw"
                width={1536}
                height={864}
                // The biggest thing on the first screen: load it first.
                fetchPriority="high"
                alt="A snowy brick house at dusk on Christmas Eve, with a wreath on the door and rocking chairs on the porch"
              />
            </picture>
            <PrintSleigh />
          </div>
        </div>
      ) : (
        <div className={styles.night}>
          <NightSky />
          <SiteHeader route={route} tone="night" />
          {hero}
        </div>
      )}

      <main className={styles.snow}>
        <div className={styles.page}>
          <h2 className={styles.shoppingFor}>Who are you shopping for?</h2>
          <ul className={styles.people}>
            {people.map((person) => (
              <li key={person.id}>
                <a href={links.shop(person.id)} className={styles.personLink}>
                  <SnowGlobe size={170} scene={person.globeScene} />
                  <span className={styles.personName}>{person.name}</span>
                </a>
              </li>
            ))}
          </ul>
          {features.spreadsheetDownload && (
            <p className={styles.download}>
              <DownloadLink />
            </p>
          )}
        </div>
      </main>
    </>
  )
}
