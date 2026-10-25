import { usePeople, useViewer } from '../data'
import { links, type Route } from './router'
import styles from './SiteHeader.module.css'

export function SiteHeader({ route }: { route: Route }) {
  const viewer = useViewer()
  const others = usePeople().filter((p) => p.id !== viewer.id)

  const items = [
    { href: links.home, label: 'Home', current: route.name === 'home' },
    { href: links.myList, label: 'My list', current: route.name === 'my-list' },
    ...others.map((p) => ({
      href: links.shop(p.id),
      label: p.name,
      current: route.name === 'shop' && route.personId === p.id,
    })),
  ]

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href={links.home} className={styles.wordmark}>
          The Family List
        </a>
        <nav aria-label="Main">
          <ul className={styles.nav}>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link} aria-current={item.current ? 'page' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
