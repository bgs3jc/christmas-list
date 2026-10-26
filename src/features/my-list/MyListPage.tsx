import { useState } from 'react'
import { features } from '../../config/features'
import { useMyList, type WishItem, type WishKind } from '../../data'
import { santasListLabels } from '../../shared/format'
import { MaybePresentIcon, PresentIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { EmptyRow, ListSection, Rows } from '../../shared/ui/List'
import { GimmeDialog, MaybeDialog } from './WishDialogs'
import { WishRow } from './WishRow'
import styles from './MyList.module.css'

type OpenDialog = { kind: WishKind; item?: WishItem } | null

export function MyListPage() {
  const { me, wishes } = useMyList()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const close = () => setDialog(null)

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        {features.santasList && me.santasList && (
          <div className={styles.santaTag}>
            <span className={styles.santaLabel}>Santa's list</span>
            <span className={styles.santaStatus}>{santasListLabels[me.santasList]}</span>
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

      <div className={styles.listSection}>
        <ListSection title="Dear Santa">
          {wishes.length === 0 ? (
            <EmptyRow>Nothing here yet. Start with one of the buttons above. Star your favorites and they go to the top.</EmptyRow>
          ) : (
            <Rows>
              {wishes.map((item) => (
                <WishRow key={item.id} item={item} onEdit={() => setDialog({ kind: item.kind, item })} />
              ))}
            </Rows>
          )}
        </ListSection>
      </div>

      {dialog?.kind === 'specific' && <GimmeDialog item={dialog.item} onClose={close} />}
      {dialog?.kind === 'maybe' && <MaybeDialog item={dialog.item} onClose={close} />}
    </main>
  )
}
