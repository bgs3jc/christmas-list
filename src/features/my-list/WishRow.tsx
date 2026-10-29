import { toggleTopPick, type WishItem } from '../../data'
import { storeFromLink } from '../../shared/format'
import { StarIcon } from '../../shared/icons'
import { Button } from '../../shared/ui/Button'
import { Details, Row, TitleNote } from '../../shared/ui/List'
import styles from './MyList.module.css'

interface WishRowProps {
  item: WishItem
  isNew?: boolean
  onEdit: () => void
}

// One wish as its owner sees it: no claims, no hints.
export function WishRow({ item, isNew, onEdit }: WishRowProps) {
  const store = storeFromLink(item.link)
  const hasDetails = Boolean(item.notes || item.link)
  return (
    <Row
      highlight={isNew}
      title={
        <>
          {item.title}
          {item.kind === 'maybe' && <TitleNote>idea</TitleNote>}
        </>
      }
      fullTitle={item.title}
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
          <Button variant="quiet" onClick={onEdit}>
            Change
          </Button>
        </>
      }
      details={
        hasDetails ? (
          <Details
            items={[
              { label: 'Your note', value: item.notes },
              {
                label: 'Link',
                value: item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer">
                    {store ?? 'Open link'}
                  </a>
                ),
              },
            ]}
          />
        ) : undefined
      }
    />
  )
}
