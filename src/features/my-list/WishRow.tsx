import { toggleTopPick, type WishItem } from '../../data'
import { storeFromLink } from '../../shared/format'
import { StarIcon } from '../../shared/icons'
import { Button } from '../../shared/ui/Button'
import { NoteLine, Row, TitleNote } from '../../shared/ui/List'
import styles from './MyList.module.css'

interface WishRowProps {
  item: WishItem
  isNew?: boolean
  onEdit: () => void
}

// One wish as its owner sees it: no claims, no hints.
export function WishRow({ item, isNew, onEdit }: WishRowProps) {
  return (
    <Row
      highlight={isNew}
      title={
        <>
          {item.title}
          {item.kind === 'maybe' && <TitleNote>idea</TitleNote>}
        </>
      }
      notes={
        <NoteLine
          parts={[
            item.notes,
            item.link && (
              <a href={item.link} target="_blank" rel="noreferrer">
                {storeFromLink(item.link) ?? 'Open link'}
              </a>
            ),
          ]}
        />
      }
      aside={
        <>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={`Gold star: ${item.title}`}
            aria-pressed={item.topPick}
            onClick={() => toggleTopPick(item.id)}
          >
            <StarIcon filled={item.topPick} />
          </button>
          <Button variant="quiet" onClick={onEdit} aria-label={`Change ${item.title}`}>
            Change
          </Button>
        </>
      }
    />
  )
}
