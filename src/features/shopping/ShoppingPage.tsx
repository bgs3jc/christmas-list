import { useState } from 'react'
import { addGift, markIdeaGifted, usePeople, useShopping, useViewer, type Gift, type GiftStatus, type WishItem } from '../../data'
import { storeFromLink, trackingLink } from '../../shared/format'
import { LockIcon, StarIcon, TruckIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { StatusPill } from '../../shared/StatusPill'
import { Button } from '../../shared/ui/Button'
import { Details, EmptyRow, ListSection, Row, Rows, TitleNote } from '../../shared/ui/List'
import { GiftDialog, type GiftDialogSetup } from './GiftDialog'
import { Overheard } from './Overheard'
import styles from './Shopping.module.css'

const progress: Record<GiftStatus, number> = { planned: 0, bought: 1, wrapped: 2 }

// For a row with several gifts, show the one furthest behind.
const leastAlong = (gifts: Gift[]) => gifts.reduce((a, b) => (progress[b.status] < progress[a.status] ? b : a)).status

export function ShoppingPage({ recipientId }: { recipientId: string }) {
  const view = useShopping(recipientId)
  const viewer = useViewer()
  const people = usePeople()
  const [dialog, setDialog] = useState<GiftDialogSetup | null>(null)

  if (!view) {
    return (
      <main className={styles.page}>
        <p>There's nobody here by that name.</p>
      </main>
    )
  }

  const { person, wishes, gifts, ideas } = view
  const others = people.filter((p) => p.id !== person.id)
  const nameOf = (id: string) => (id === viewer.id ? 'You' : (people.find((p) => p.id === id)?.name ?? 'Someone'))
  const houseOf = (id: string) => (id === viewer.id ? 'your place' : `${nameOf(id)}'s`)

  const giftsByWish = new Map<string, Gift[]>()
  for (const gift of gifts) {
    if (gift.wishItemId) giftsByWish.set(gift.wishItemId, [...(giftsByWish.get(gift.wishItemId) ?? []), gift])
  }
  const wishIds = new Set(wishes.map((w) => w.id))
  // Surprises, plus anything whose list item was since removed.
  const surprises = gifts.filter((g) => !g.wishItemId || !wishIds.has(g.wishItemId))

  function claim(wish: WishItem) {
    addGift({ recipientId: person.id, giverId: viewer.id, title: wish.title, wishItemId: wish.id, status: 'planned', place: 'tree' })
  }

  const editGift = (gift: Gift, fromList = false) => setDialog({ heading: 'Change this gift', gift, fromList })

  // Who's getting it, with a truck while it's on its way somewhere.
  const giver = (gift: Gift) => (
    <>
      {gift.shipTo && !gift.arrived && (
        <span className={styles.truck} role="img" aria-label={`Shipping to ${houseOf(gift.shipTo)}`}>
          <TruckIcon />
        </span>
      )}
      {nameOf(gift.giverId)}
    </>
  )

  const shippingText = (gift: Gift) => {
    if (!gift.shipTo) return undefined
    if (gift.arrived) return `Arrived at ${houseOf(gift.shipTo)}`
    const track = gift.tracking && trackingLink(gift.tracking)
    return (
      <>
        Shipping to {houseOf(gift.shipTo)}
        {track && (
          <>
            {' · '}
            <a href={track.url} target="_blank" rel="noreferrer">
              Track{track.carrier && ` (${track.carrier})`}
            </a>
          </>
        )}
      </>
    )
  }

  const giftDetails = (gift: Gift) => [
    { label: 'Paid', value: gift.price },
    { label: 'Shipping', value: shippingText(gift) },
    { label: 'Family notes', value: gift.notes },
  ]

  const wishDetails = (wish: WishItem) => [
    { label: `${person.name}'s note`, value: wish.notes },
    {
      label: 'Link',
      value: wish.link && (
        <a href={wish.link} target="_blank" rel="noreferrer">
          {storeFromLink(wish.link) ?? 'Open link'}
        </a>
      ),
    },
  ]

  const wishTitle = (wish: WishItem) => (
    <>
      {wish.title}
      {wish.kind === 'maybe' && <TitleNote>idea</TitleNote>}
      {wish.topPick && (
        <span className={styles.favorite} role="img" aria-label="Favorite">
          <StarIcon filled size={13} />
        </span>
      )}
    </>
  )

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <SnowGlobe size={88} gifts={gifts.map((g) => g.status)} label={`${person.name}'s snow globe, with gifts piling up`} />
        <div>
          <h1 className={styles.name}>Shopping for {person.name}</h1>
          <p className={styles.private}>
            <LockIcon />
            {person.name} can't see this page
          </p>
        </div>
      </div>

      <ListSection title={`${person.name}'s list`}>
        {wishes.length === 0 ? (
          <EmptyRow>{person.name} hasn't added anything yet.</EmptyRow>
        ) : (
          <Rows>
            {wishes.map((wish) => {
              const under = giftsByWish.get(wish.id) ?? []

              if (wish.kind === 'maybe') {
                const addUnder = () => setDialog({ heading: `A gift for "${wish.title}"`, wishItemId: wish.id })
                return (
                  <Row
                    key={wish.id}
                    status={<StatusPill status={under.length ? leastAlong(under) : 'open'} />}
                    title={wishTitle(wish)}
                    fullTitle={wish.title}
                    aside={under.length ? [...new Set(under.map((g) => nameOf(g.giverId)))].join(', ') : <Button onClick={addUnder}>Add a gift</Button>}
                    details={
                      <Details items={wishDetails(wish)} actions={<Button onClick={addUnder}>Add a gift for this</Button>}>
                        {under.length > 0 && (
                          <ul className={styles.underIdea}>
                            {under.map((gift) => (
                              <li key={gift.id} className={styles.underIdeaGift}>
                                <StatusPill status={gift.status} />
                                <span className={styles.underIdeaTitle}>{gift.title}</span>
                                <span className={styles.underIdeaWho}>{giver(gift)}</span>
                                <Button variant="quiet" onClick={() => editGift(gift)} aria-label={`Change ${gift.title}`}>
                                  Change
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Details>
                    }
                  />
                )
              }

              const gift = under[0]
              return (
                <Row
                  key={wish.id}
                  status={<StatusPill status={gift ? gift.status : 'open'} />}
                  title={wishTitle(wish)}
                  fullTitle={wish.title}
                  aside={gift ? giver(gift) : <Button onClick={() => claim(wish)}>I'll get it</Button>}
                  details={
                    <Details
                      items={gift ? [...wishDetails(wish), ...giftDetails(gift)] : wishDetails(wish)}
                      actions={
                        gift ? (
                          <Button onClick={() => editGift(gift, true)}>Change</Button>
                        ) : (
                          <Button
                            variant="quiet"
                            onClick={() => setDialog({ heading: 'Someone else is getting it', title: wish.title, wishItemId: wish.id, fromList: true })}
                          >
                            Put someone else down for this
                          </Button>
                        )
                      }
                    />
                  }
                />
              )
            })}
          </Rows>
        )}
      </ListSection>

      <ListSection
        title="Surprises & stockings"
        action={
          <Button variant="main" onClick={() => setDialog({ heading: `Add a gift for ${person.name}` })}>
            Add a gift
          </Button>
        }
      >
        {surprises.length === 0 ? (
          <EmptyRow>Nothing yet. Gifts that aren't on {person.name}'s list go here.</EmptyRow>
        ) : (
          <Rows>
            {surprises.map((gift) => (
              <Row
                key={gift.id}
                status={<StatusPill status={gift.status} />}
                title={
                  <>
                    {gift.title}
                    {gift.place === 'stocking' && <TitleNote>stocking</TitleNote>}
                  </>
                }
                fullTitle={gift.title}
                aside={giver(gift)}
                details={<Details items={giftDetails(gift)} actions={<Button onClick={() => editGift(gift)}>Change</Button>} />}
              />
            ))}
          </Rows>
        )}
      </ListSection>

      <Overheard
        person={person}
        ideas={ideas}
        nameOf={nameOf}
        onMakeGift={(idea) => setDialog({ heading: `Add a gift for ${person.name}`, title: idea.text, onSaved: () => markIdeaGifted(idea.id) })}
      />

      {dialog && <GiftDialog setup={dialog} recipient={person} others={others} viewerId={viewer.id} onClose={() => setDialog(null)} />}
    </main>
  )
}
