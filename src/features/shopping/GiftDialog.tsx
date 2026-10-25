import { useState } from 'react'
import { addGift, removeGift, updateGift, type Gift, type GiftPlace, type GiftStatus, type Person } from '../../data'
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
  wishItemId?: string
  price?: string
  // A gift claimed from the list keeps the list's name, and always goes under the tree.
  fromList?: boolean
  onSaved?: () => void
}

interface GiftDialogProps {
  setup: GiftDialogSetup
  recipient: Person
  givers: Person[]
  viewerId: string
  onClose: () => void
}

const statusOptions: { value: GiftStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'bought', label: 'Bought' },
  { value: 'wrapped', label: 'Wrapped' },
]

const placeOptions: { value: GiftPlace; label: string }[] = [
  { value: 'tree', label: 'Under the tree' },
  { value: 'stocking', label: 'Stocking' },
]

export function GiftDialog({ setup, recipient, givers, viewerId, onClose }: GiftDialogProps) {
  const { gift } = setup
  const [title, setTitle] = useState(gift?.title ?? setup.title ?? '')
  const [giverId, setGiverId] = useState(gift?.giverId ?? viewerId)
  const [status, setStatus] = useState<GiftStatus>(gift?.status ?? 'planned')
  const [place, setPlace] = useState<GiftPlace>(gift?.place ?? 'tree')
  const [price, setPrice] = useState(gift?.price ?? setup.price ?? '')
  const [notes, setNotes] = useState(gift?.notes ?? '')

  const giverOptions = givers.map((p) => ({ value: p.id, label: p.id === viewerId ? 'Me' : p.name }))

  function save() {
    if (!title.trim()) return
    const fields = {
      title: title.trim(),
      giverId,
      status,
      place: setup.fromList ? 'tree' : place,
      price: price.trim() || undefined,
      notes: notes.trim() || undefined,
    } as const
    if (gift) updateGift(gift.id, fields)
    else addGift({ ...fields, recipientId: recipient.id, wishItemId: setup.wishItemId })
    setup.onSaved?.()
    onClose()
  }

  function remove() {
    if (gift && window.confirm(`Remove "${gift.title}"? Nobody will be down for it anymore.`)) {
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
              Remove
            </Button>
          )}
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="main" type="submit" disabled={!title.trim()}>
            Save
          </Button>
        </>
      }
    >
      {setup.fromList ? (
        <p className={styles.dialogItem}>{title}</p>
      ) : (
        <TextField label="What is it?" value={title} onChange={setTitle} autoFocus={!gift && !title} />
      )}
      <Choice legend="Who's getting it?" options={giverOptions} value={giverId} onChange={setGiverId} />
      <Choice legend="How far along?" options={statusOptions} value={status} onChange={setStatus} />
      {!setup.fromList && <Choice legend="Where does it go?" options={placeOptions} value={place} onChange={setPlace} />}
      <TextField label="Price" value={price} onChange={setPrice} narrow />
      <TextField label="Notes for the family" value={notes} onChange={setNotes} multiline help={`${recipient.name} never sees this.`} />
    </Dialog>
  )
}
