import { moveWish, toggleTopPick, type WishItem } from '../../data'
import { wishDetails } from '../../shared/format'
import { ArrowIcon, StarIcon } from '../../shared/icons'
import { Button } from '../../shared/ui/Button'
import list from '../../shared/ui/List.module.css'
import styles from './MyList.module.css'

interface WishRowProps {
  item: WishItem
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
}

// One wish as its owner sees it: no claims, no hints.
export function WishRow({ item, isFirst, isLast, onEdit }: WishRowProps) {
  const details = wishDetails(item)
  return (
    <li className={list.row}>
      <div className={list.rowMain}>
        <div className={list.titleLine}>
          {item.kind === 'maybe' && <span className={list.maybeTag}>Maybe</span>}
          {item.link ? (
            <a href={item.link} target="_blank" rel="noreferrer" className={list.title}>
              {item.title}
            </a>
          ) : (
            <span className={list.title}>{item.title}</span>
          )}
        </div>
        {details && <p className={list.details}>{details}</p>}
      </div>
      <div className={list.actions}>
        <span className={styles.iconGroup}>
          <button type="button" className={styles.iconButton} aria-label={`Move ${item.title} up`} disabled={isFirst} onClick={() => moveWish(item.id, -1)}>
            <ArrowIcon direction="up" />
          </button>
          <button type="button" className={styles.iconButton} aria-label={`Move ${item.title} down`} disabled={isLast} onClick={() => moveWish(item.id, 1)}>
            <ArrowIcon direction="down" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={`${item.title} is a top pick`}
            aria-pressed={item.topPick}
            onClick={() => toggleTopPick(item.id)}
          >
            <StarIcon filled={item.topPick} />
          </button>
        </span>
        <Button variant="quiet" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </li>
  )
}
