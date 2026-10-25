import { toggleTopPick, type WishItem } from '../../data'
import { wishDetails } from '../../shared/format'
import { StarIcon } from '../../shared/icons'
import { Button } from '../../shared/ui/Button'
import list from '../../shared/ui/List.module.css'
import styles from './MyList.module.css'

interface WishRowProps {
  item: WishItem
  onEdit: () => void
}

// One wish as its owner sees it: no claims, no hints.
export function WishRow({ item, onEdit }: WishRowProps) {
  const details = wishDetails(item)
  return (
    <li className={list.row}>
      <div className={list.rowMain}>
        <div className={list.titleLine}>
          {item.kind === 'maybe' && <span className={list.ideaTag}>Idea</span>}
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
        <button
          type="button"
          className={styles.iconButton}
          aria-label={`${item.title} is a top pick`}
          aria-pressed={item.topPick}
          onClick={() => toggleTopPick(item.id)}
        >
          <StarIcon filled={item.topPick} />
        </button>
        <Button variant="quiet" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </li>
  )
}
