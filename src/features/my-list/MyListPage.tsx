import { useEffect, useState } from 'react'
import { features } from '../../config/features'
import { useMyList, type WishItem, type WishKind } from '../../data'
import { santasListLabels } from '../../shared/format'
import { LightbulbIcon, PresentIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { EmptyRow, ListSection, Rows } from '../../shared/ui/List'
import { Shelf } from '../../shared/ui/Shelf'
import { GimmeDialog, MaybeDialog } from './WishDialogs'
import { WishRow } from './WishRow'
import styles from './MyList.module.css'

type OpenDialog = { kind: WishKind; item?: WishItem } | null

export function MyListPage() {
  const { me, wishes } = useMyList()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const close = () => setDialog(null)
  // Just added: pointed out for a few seconds, since new things go to the bottom.
  const [justAdded, setJustAdded] = useState<string[]>([])

  useEffect(() => {
    if (justAdded.length === 0) return
    const timer = window.setTimeout(() => setJustAdded([]), 3000)
    return () => window.clearTimeout(timer)
  }, [justAdded])

  return (
    <Shelf
      aside={
        <>
          <SnowGlobe size={260} scene={me.globeScene} />
          <h1 className={styles.title}>My list</h1>
          <p className={styles.subtitle}>Everyone shops from this. Nobody will tell you what's been taken.</p>
          {features.santasList && me.santasList && (
            // A printed gift tag on a gold string
            <p className={styles.santaTag}>
              <span className={styles.santaLabel}>Santa's list</span>
              <span className={styles.santaStatus}>{santasListLabels[me.santasList]}</span>
            </p>
          )}
        </>
      }
    >
      <div className={styles.addButtons}>
        <button type="button" className={`${styles.bigButton} ${styles.gimme}`} onClick={() => setDialog({ kind: 'specific' })}>
          <PresentIcon />
          <span className={styles.bigText}>
            <span className={styles.bigTitle}>Gimme, gimme, gimme</span>
            <span className={styles.bigHint}>Something specific. Paste a link or describe it.</span>
          </span>
        </button>
        <button type="button" className={`${styles.bigButton} ${styles.idea}`} onClick={() => setDialog({ kind: 'maybe' })}>
          <LightbulbIcon />
          <span className={styles.bigText}>
            <span className={styles.bigTitle}>An idea…</span>
            <span className={styles.bigHint}>A store, a brand or a hobby. Santa picks.</span>
          </span>
        </button>
      </div>

      <div className={styles.listSection}>
        <ListSection title="Dear Santa">
          {wishes.length === 0 ? (
            <EmptyRow>Nothing here yet. Start with one of the buttons above. Give your favorites a gold star and they go to the top.</EmptyRow>
          ) : (
            <Rows>
              {wishes.map((item) => (
                <WishRow
                  key={item.id}
                  item={item}
                  isNew={justAdded.includes(item.id)}
                  onEdit={() => setDialog({ kind: item.kind, item })}
                />
              ))}
            </Rows>
          )}
        </ListSection>
      </div>

      {dialog?.kind === 'specific' && <GimmeDialog item={dialog.item} onClose={close} onAdded={setJustAdded} />}
      {dialog?.kind === 'maybe' && <MaybeDialog item={dialog.item} onClose={close} onAdded={setJustAdded} />}
    </Shelf>
  )
}
