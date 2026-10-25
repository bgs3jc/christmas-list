import { useState } from 'react'
import { features } from '../../config/features'
import { useMyList, usePeople, type WishItem, type WishKind } from '../../data'
import { plural, santasListLabels } from '../../shared/format'
import { MaybePresentIcon, PresentIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import list from '../../shared/ui/List.module.css'
import { GimmeDialog, MaybeDialog } from './WishDialogs'
import { WishRow } from './WishRow'
import styles from './MyList.module.css'

type OpenDialog = { kind: WishKind; item?: WishItem } | null

export function MyListPage() {
  const { me, wishes } = useMyList()
  const people = usePeople()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const close = () => setDialog(null)

  const santa = me.santasList
  const setBy = santa && people.find((p) => p.id === santa.setBy)

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        {features.santasList && santa && setBy && (
          <div className={styles.santaTag}>
            <span className={styles.santaLabel}>Santa's list</span>
            <span className={styles.santaStatus}>{santasListLabels[santa.status]}</span>
            <span className={styles.santaLabel}>says {setBy.name}</span>
          </div>
        )}
        <SnowGlobe size={150} />
        <h1 className={styles.title}>My list</h1>
        <p className={styles.subtitle}>Everyone shops from this. Nobody will tell you what's been taken.</p>
      </div>

      <div className={styles.addButtons}>
        <button type="button" className={styles.bigButton} onClick={() => setDialog({ kind: 'specific' })}>
          <PresentIcon />
          <span className={styles.bigText}>
            <span className={styles.bigTitle}>Gimme, gimme, gimme</span>
            <span className={styles.bigHint}>Something specific. Paste a link or describe it.</span>
          </span>
        </button>
        <button type="button" className={styles.bigButton} onClick={() => setDialog({ kind: 'maybe' })}>
          <MaybePresentIcon />
          <span className={styles.bigText}>
            <span className={styles.bigTitle}>Maybe an idea…</span>
            <span className={styles.bigHint}>A store, brand or kind of thing. They pick.</span>
          </span>
        </button>
      </div>

      <section aria-labelledby="my-list-heading" className={styles.listSection}>
        <div className={list.sectionHead}>
          <h2 id="my-list-heading" className={list.sectionTitle}>
            Dear Santa
          </h2>
          {wishes.length > 1 && <span className={list.sectionCount}>{plural(wishes.length, 'thing')} · use the arrows to put them in order</span>}
        </div>
        {wishes.length === 0 ? (
          <p className={list.empty}>Nothing here yet. Start with one of the buttons above.</p>
        ) : (
          <ul className={list.rows}>
            {wishes.map((item, i) => (
              <WishRow
                key={item.id}
                item={item}
                isFirst={i === 0}
                isLast={i === wishes.length - 1}
                onEdit={() => setDialog({ kind: item.kind, item })}
              />
            ))}
          </ul>
        )}
      </section>

      {dialog?.kind === 'specific' && <GimmeDialog item={dialog.item} onClose={close} />}
      {dialog?.kind === 'maybe' && <MaybeDialog item={dialog.item} onClose={close} />}
    </main>
  )
}
