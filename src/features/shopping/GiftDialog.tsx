import { useState } from 'react'
import { addGift, removeGift, updateGift, type Gift, type GiftPlace, type GiftStatus, type Person } from '../../data'
import { trackingLink } from '../../shared/format'
import { Button } from '../../shared/ui/Button'
import { Dialog } from '../../shared/ui/Dialog'
import { Checkbox, Choice, TextField } from '../../shared/ui/Form'
import styles from './Shopping.module.css'

export interface GiftDialogSetup {
  heading: string
  // Editing an existing gift...
  gift?: Gift
  // ...or starting a new one with some of it filled in.
  title?: string
  wishItemId?: string
  // A gift claimed from the list keeps the list's name, and always goes under the tree.
  fromList?: boolean
  onSaved?: () => void
}

interface GiftDialogProps {
  setup: GiftDialogSetup
  recipient: Person
  // Everyone but the recipient: they can give, and gifts can ship to their houses.
  others: Person[]
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

const NOT_SHIPPING = 'none'

export function GiftDialog({ setup, recipient, others, viewerId, onClose }: GiftDialogProps) {
  const { gift } = setup
  const [title, setTitle] = useState(gift?.title ?? setup.title ?? '')
  const [giverId, setGiverId] = useState(gift?.giverId ?? viewerId)
  const [status, setStatus] = useState<GiftStatus>(gift?.status ?? 'planned')
  const [place, setPlace] = useState<GiftPlace>(gift?.place ?? 'tree')
  const [price, setPrice] = useState(gift?.price ?? '')
  const [notes, setNotes] = useState(gift?.notes ?? '')
  const [shipTo, setShipTo] = useState(gift?.shipTo ?? NOT_SHIPPING)
  const [tracking, setTracking] = useState(gift?.tracking ?? '')
  const [arrived, setArrived] = useState(gift?.arrived ?? false)

  const nameFor = (p: Person) => (p.id === viewerId ? 'Me' : p.name)
  const shipOptions = [
    { value: NOT_SHIPPING, label: 'Not shipping' },
    ...others.map((p) => ({ value: p.id, label: p.id === viewerId ? 'To mine' : `To ${p.name}'s` })),
  ]
  const shipping = shipTo !== NOT_SHIPPING
  const carrier = tracking.trim() ? trackingLink(tracking).carrier : ''

  function save() {
    if (!title.trim()) return
    const fields = {
      title: title.trim(),
      giverId,
      status,
      place: setup.fromList ? 'tree' : place,
      price: price.trim() || undefined,
      notes: notes.trim() || undefined,
      shipTo: shipping ? shipTo : undefined,
      tracking: shipping ? tracking.trim() || undefined : undefined,
      arrived: shipping ? arrived : undefined,
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
      <Choice legend="Who's getting it?" options={others.map((p) => ({ value: p.id, label: nameFor(p) }))} value={giverId} onChange={setGiverId} />
      <Choice legend="How far along?" options={statusOptions} value={status} onChange={setStatus} />
      {!setup.fromList && <Choice legend="Where does it go?" options={placeOptions} value={place} onChange={setPlace} />}

      <div className={styles.shippingBox}>
        <Choice legend="Shipping" options={shipOptions} value={shipTo} onChange={setShipTo} />
        {shipping && (
          <>
            <TextField
              label="Tracking number"
              value={tracking}
              onChange={setTracking}
              help={carrier ? `Looks like ${carrier}. It becomes a Track link on the list.` : 'Optional. It becomes a Track link on the list.'}
            />
            <Checkbox label="It arrived" checked={arrived} onChange={setArrived} />
          </>
        )}
      </div>

      <TextField label="Price paid" value={price} onChange={setPrice} narrow />
      <TextField label="Notes for the family" value={notes} onChange={setNotes} multiline help={`${recipient.name} never sees this.`} />
    </Dialog>
  )
}
