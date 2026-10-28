import { useState } from 'react'
import { addGift, markIdeaGifted, updateGift, useHomes, usePeople, useShopping, useViewer, type Gift, type WishItem } from '../../data'
import { storeFromLink } from '../../shared/format'
import { LockIcon, StarIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { StatusPill } from '../../shared/StatusPill'
import { Button } from '../../shared/ui/Button'
import { Details, EmptyRow, ListSection, Row, Rows, TitleNote } from '../../shared/ui/List'
import { GiftDialog, type GiftDialogSetup } from './GiftDialog'
import { Overheard } from './Overheard'
import styles from './Shopping.module.css'

// An idea with several gifts under it counts as bought once they all are.
const allBought = (gifts: Gift[]) => gifts.every((g) => g.bought)

export function ShoppingPage({ recipientId }: { recipientId: string }) {
  const view = useShopping(recipientId)
  const viewer = useViewer()
  const people = usePeople()
  const homes = useHomes()
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
  const houseOf = (id: string) => (id === viewer.homeId ? 'your place' : (homes.find((h) => h.id === id)?.name ?? 'somewhere'))

  const giftsByWish = new Map<string, Gift[]>()
  for (const gift of gifts) {
    if (gift.wishItemId) giftsByWish.set(gift.wishItemId, [...(giftsByWish.get(gift.wishItemId) ?? []), gift])
  }
  const wishIds = new Set(wishes.map((w) => w.id))
  // Surprises, plus anything whose list item was since removed.
  const surprises = gifts.filter((g) => !g.wishItemId || !wishIds.has(g.wishItemId))

  function claim(wish: WishItem) {
    addGift({ recipientId: person.id, giverId: viewer.id, title: wish.title, wishItemId: wish.id, bought: false, place: 'tree' })
  }

  const editGift = (gift: Gift, fromList = false) => setDialog({ heading: 'Change this gift', gift, fromList })

  // Bought or not. On your own gifts it's a one-tap switch.
  const pill = (gift: Gift) => (
    <StatusPill
      status={gift.bought ? 'bought' : 'notBought'}
      onToggle={gift.giverId === viewer.id ? () => updateGift(gift.id, { bought: !gift.bought }) : undefined}
    />
  )

  const linkTo = (link?: string) =>
    link && (
      <a href={link} target="_blank" rel="noreferrer">
        {storeFromLink(link) ?? 'Open link'}
      </a>
    )

  // Shipping shows right after the name, so nobody has to open the row to see it.
  const shipNote = (gift: Gift) => gift.shipTo && <TitleNote>to {houseOf(gift.shipTo)}</TitleNote>

  const giftDetails = (gift: Gift) => [
    { label: 'Link', value: linkTo(gift.link) },
    { label: 'Family notes', value: gift.notes },
  ]

  const wishDetails = (wish: WishItem) => [
    { label: `${person.name}'s note`, value: wish.notes },
    { label: 'Link', value: linkTo(wish.link) },
  ]

  const wishTitle = (wish: WishItem) => (
    <>
      {wish.title}
      {wish.kind === 'maybe' && <TitleNote>idea</TitleNote>}
      {wish.topPick && (
        <span className={styles.favorite} role="img" aria-label="Gold star">
          <StarIcon filled size={13} />
        </span>
      )}
    </>
  )

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <SnowGlobe size={88} gifts={gifts.map((g) => g.bought)} label={`${person.name}'s snow globe, with gifts piling up`} />
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
                    status={<StatusPill status={!under.length ? 'open' : allBought(under) ? 'bought' : 'notBought'} />}
                    title={wishTitle(wish)}
                    fullTitle={wish.title}
                    aside={under.length ? [...new Set(under.map((g) => nameOf(g.giverId)))].join(', ') : <Button onClick={addUnder}>Add a gift</Button>}
                    details={
                      <Details items={wishDetails(wish)} actions={<Button onClick={addUnder}>Add a gift for this</Button>}>
                        {under.length > 0 && (
                          <ul className={styles.underIdea}>
                            {under.map((gift) => (
                              <li key={gift.id} className={styles.underIdeaGift}>
                                {pill(gift)}
                                <span className={styles.underIdeaText}>
                                  <span className={styles.underIdeaTitle} title={gift.title}>
                                    {gift.title}
                                    {shipNote(gift)}
                                  </span>
                                  {(gift.notes || gift.link) && (
                                    <span className={styles.underIdeaNotes}>
                                      {gift.notes}
                                      {gift.notes && gift.link && ' · '}
                                      {linkTo(gift.link)}
                                    </span>
                                  )}
                                </span>
                                <span className={styles.underIdeaWho}>{nameOf(gift.giverId)}</span>
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
                  status={gift ? pill(gift) : <StatusPill status="open" />}
                  title={
                    <>
                      {wishTitle(wish)}
                      {gift && shipNote(gift)}
                    </>
                  }
                  fullTitle={wish.title}
                  aside={gift ? nameOf(gift.giverId) : <Button onClick={() => claim(wish)}>I'll get it</Button>}
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
                status={pill(gift)}
                title={
                  <>
                    {gift.title}
                    {gift.place === 'stocking' && <TitleNote>stocking</TitleNote>}
                    {shipNote(gift)}
                  </>
                }
                fullTitle={gift.title}
                aside={nameOf(gift.giverId)}
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

      {dialog && <GiftDialog
          setup={dialog}
          recipient={person}
          others={others}
          homes={homes.filter((h) => h.id !== person.homeId)}
          viewer={viewer}
          onClose={() => setDialog(null)}
        />}
    </main>
  )
}
