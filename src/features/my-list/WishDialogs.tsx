import { useState } from 'react'
import { addWishes, removeWish, updateWish, type WishItem } from '../../data'
import { storeFromLink } from '../../shared/format'
import { StarIcon } from '../../shared/icons'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { TextField } from '../../shared/ui/Form'
import { parsePaste } from './parsePaste'
import styles from './MyList.module.css'

interface WishDialogProps {
  // Leave out to add something new.
  item?: WishItem
  onClose: () => void
  // Told the ids of anything new, so the list can point it out.
  onAdded: (ids: string[]) => void
}

const blankToUndefined = (value: string) => value.trim() || undefined

function confirmRemove(item: WishItem, onClose: () => void) {
  if (window.confirm(`Take "${item.title}" off your list?`)) {
    removeWish(item.id)
    onClose()
  }
}

// "Gimme, gimme, gimme": one specific thing, or several pasted at once.
export function GimmeDialog({ item, onClose, onAdded }: WishDialogProps) {
  const [linkText, setLinkText] = useState(item?.link ?? '')
  const [name, setName] = useState(item?.title ?? '')
  const [nameEdited, setNameEdited] = useState(Boolean(item))
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [topPick, setTopPick] = useState(item?.topPick ?? false)

  const pasted = item ? [] : parsePaste(linkText)
  const several = pasted.length > 1
  const first = pasted[0]
  // When adding, a name is only asked for once there's a link to name.
  const showName = Boolean(item) || Boolean(first?.link)
  const shownName = nameEdited ? name : (first?.title ?? '')

  function save() {
    if (item) {
      if (!name.trim()) return
      updateWish(item.id, {
        title: name.trim(),
        link: blankToUndefined(linkText),
        notes: blankToUndefined(notes),
        topPick,
      })
    } else if (several) {
      onAdded(addWishes(pasted.map((p) => ({ kind: 'specific', topPick: false, ...p }))))
    } else if (first) {
      const ids = addWishes([
        {
          kind: 'specific',
          title: (first.link ? shownName : first.title).trim() || first.title,
          link: first.link,
          notes: blankToUndefined(notes) ?? first.notes,
          topPick,
        },
      ])
      onAdded(ids)
    } else {
      return
    }
    onClose()
  }

  const canSave = item ? Boolean(name.trim()) : pasted.length > 0

  return (
    <Dialog
      title={item ? 'Change this' : 'Gimme, gimme, gimme'}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          {item && (
            <Button variant="quiet" className={styles.removeButton} onClick={() => confirmRemove(item, onClose)}>
              Take off my list
            </Button>
          )}
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="main" type="submit" disabled={!canSave}>
            {several ? `Add all ${pasted.length}` : item ? 'Save' : 'Add to my list'}
          </Button>
        </>
      }
    >
      {item ? (
        <TextField label="Link" value={linkText} onChange={setLinkText} placeholder="https://…" />
      ) : (
        <TextField
          label="Link, or what it is"
          value={linkText}
          onChange={setLinkText}
          multiline
          autoFocus
          help="Got several? Paste them all, one per line."
        />
      )}

      {several ? (
        <div>
          <p className={styles.foundTitle}>Found {pasted.length} things. Look right?</p>
          <ul className={styles.found}>
            {pasted.map((p, i) => (
              <li key={i}>
                <span className={styles.foundName}>{p.title}</span>
                <span className={styles.foundDetails}>
                  {[storeFromLink(p.link) ?? 'No link', p.notes].filter(Boolean).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          {showName && (
            <TextField
              label="Name"
              value={shownName}
              onChange={(value) => {
                setName(value)
                setNameEdited(true)
              }}
              help={item ? undefined : 'Filled in from the link. Fix it if it\'s off.'}
            />
          )}
          <TextField
            label="Size, color, anything Santa should know"
            value={notes}
            onChange={setNotes}
            multiline
            placeholder={first?.notes}
          />
          <GoldStar on={topPick} onChange={setTopPick} />
        </>
      )}
    </Dialog>
  )
}

// "An idea…": a store, brand or kind of thing. The giver picks.
export function MaybeDialog({ item, onClose, onAdded }: WishDialogProps) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [notes, setNotes] = useState(item?.notes ?? '')

  function save() {
    if (!title.trim()) return
    const fields = { title: title.trim(), notes: blankToUndefined(notes) }
    if (item) updateWish(item.id, fields)
    else onAdded(addWishes([{ kind: 'maybe', topPick: false, ...fields }]))
    onClose()
  }

  return (
    <Dialog
      title={item ? 'Change this' : 'An idea…'}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          {item && (
            <Button variant="quiet" className={styles.removeButton} onClick={() => confirmRemove(item, onClose)}>
              Take off my list
            </Button>
          )}
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="main" type="submit" disabled={!title.trim()}>
            {item ? 'Save' : 'Add to my list'}
          </Button>
        </>
      }
    >
      <TextField
        label="What should Santa look for?"
        value={title}
        onChange={setTitle}
        autoFocus
        help="A store, a brand or a hobby. Santa picks the gift."
      />
      <TextField
        label="Help Santa choose"
        value={notes}
        onChange={setNotes}
        multiline
        rows={3}
        help="Sizes, favorites, what you already have."
      />
    </Dialog>
  )
}

// Favorites get a gold star and go to the top of the list.
function GoldStar({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button type="button" className={styles.goldStar} aria-pressed={on} onClick={() => onChange(!on)}>
      <StarIcon filled={on} />
      {on ? 'Gold star' : 'Give it a gold star'}
    </button>
  )
}
