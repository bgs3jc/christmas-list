import { useState } from 'react'
import { addGift, removeGift, updateGift, type Gift, type GiftPlace, type Home, type Person } from '../../data'
import { isLink, nameFromLink } from '../../shared/format'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { Choice, TextField } from '../../shared/ui/Form'
import styles from './Shopping.module.css'

export interface GiftDialogSetup {
  heading: string
  // Editing an existing gift...
  gift?: Gift
  // ...or starting a new one with some of it filled in.
  title?: string
  notes?: string
  wishItemId?: string
  // A gift claimed from the list keeps the list's name, and always goes under the tree.
  fromList?: boolean
  onSaved?: () => void
}

interface GiftDialogProps {
  setup: GiftDialogSetup
  recipient: Person
  // Everyone but the recipient: they can give.
  others: Person[]
  // Houses a gift can ship to: never the recipient's.
  homes: Home[]
  viewer: Person
  onClose: () => void
}

const placeOptions: { value: GiftPlace; label: string }[] = [
  { value: 'tree', label: 'Under the tree' },
  { value: 'stocking', label: 'Stocking' },
]

const NOT_SHIPPING = 'none'

export function GiftDialog({ setup, recipient, others, homes, viewer, onClose }: GiftDialogProps) {
  const { gift } = setup
  // A new gift starts with one box, a link or what it is, like adding to your
  // own list. A pasted link gets a Name box, filled in from the link.
  const [entry, setEntry] = useState(setup.title ?? '')
  const [name, setName] = useState(gift?.title ?? '')
  const [nameEdited, setNameEdited] = useState(Boolean(gift))
  const [link, setLink] = useState(gift?.link ?? '')
  const [giverId, setGiverId] = useState(gift?.giverId ?? viewer.id)
  const [place, setPlace] = useState<GiftPlace>(gift?.place ?? 'tree')
  const [notes, setNotes] = useState(gift?.notes ?? setup.notes ?? '')
  const [shipTo, setShipTo] = useState(gift?.shipTo ?? NOT_SHIPPING)

  const nameFor = (p: Person) => (p.id === viewer.id ? 'Me' : p.name)
  const shipOptions = [
    { value: NOT_SHIPPING, label: 'Not shipping' },
    ...homes.map((h) => ({ value: h.id, label: h.id === viewer.homeId ? 'To my place' : `To ${h.name}` })),
  ]

  const entryIsLink = !gift && isLink(entry)
  const shownName = nameEdited ? name : entryIsLink ? nameFromLink(entry.trim()) : ''
  const title = gift || entryIsLink ? shownName : entry
  const showName = Boolean(gift) || entryIsLink

  function save() {
    if (!title.trim()) return
    const fields = {
      title: title.trim(),
      link: (gift ? link : entryIsLink ? entry : '').trim() || undefined,
      giverId,
      place: setup.fromList ? 'tree' : place,
      notes: notes.trim() || undefined,
      shipTo: shipTo === NOT_SHIPPING ? undefined : shipTo,
    } as const
    if (gift) updateGift(gift.id, fields)
    else addGift({ ...fields, recipientId: recipient.id, wishItemId: setup.wishItemId })
    setup.onSaved?.()
    onClose()
  }

  function remove() {
    const message = gift?.wishItemId
      ? `Not getting "${gift.title}" after all? It goes back to needing a Santa.`
      : `Not getting "${gift?.title}" after all? It comes off this page.`
    if (gift && window.confirm(message)) {
      removeGift(gift.id)
      onClose()
    }
  }

  return (
    <Dialog
      title={setup.heading}
      onClose={onClose}
      onSubmit={save}
      footer={
        <>
          {gift && (
            <Button variant="quiet" className={styles.removeButton} onClick={remove}>
              Not getting it
            </Button>
          )}
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="main" type="submit">
            Save
          </Button>
        </>
      }
    >
      {setup.fromList ? (
        <p className={styles.dialogItem}>{title}</p>
      ) : (
        <>
          {!gift && (
            <TextField
              label="Link, or what it is"
              value={entry}
              onChange={setEntry}
              autoFocus
              required
              help="Paste a link and it gets named for you."
            />
          )}
          {showName && (
            <TextField
              label="Name"
              value={shownName}
              onChange={(value) => {
                setName(value)
                setNameEdited(true)
              }}
              required
              help={gift ? undefined : "Filled in from the link. Fix it if it's off."}
            />
          )}
          {gift && <TextField label="Link" value={link} onChange={setLink} placeholder="https://…" link />}
        </>
      )}
      <Choice legend="Who's getting it?" options={others.map((p) => ({ value: p.id, label: nameFor(p) }))} value={giverId} onChange={setGiverId} />
      {!setup.fromList && <Choice legend="Where does it go?" options={placeOptions} value={place} onChange={setPlace} />}
      <Choice legend="Shipping somewhere?" options={shipOptions} value={shipTo} onChange={setShipTo} />
      <TextField label="Notes for the family" value={notes} onChange={setNotes} multiline help={`${recipient.name} never sees this.`} />
    </Dialog>
  )
}
