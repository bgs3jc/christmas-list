import { useState } from 'react'
import { addGift, markIdeaGifted, useHomes, usePeople, useShopping, useViewer, type Gift, type WishItem } from '../../data'
import { coverLabel, storeFromLink } from '../../shared/format'
import { LockIcon, StarIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { StatusPill } from '../../shared/StatusPill'
import { Button } from '../../shared/ui/Button'
import { EmptyRow, ListSection, NoteLine, Row, Rows, TitleNote } from '../../shared/ui/List'
import { GiftDialog, type GiftDialogSetup } from './GiftDialog'
import { Overheard } from './Overheard'
import styles from './Shopping.module.css'


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
    addGift({ recipientId: person.id, giverId: viewer.id, title: wish.title, wishItemId: wish.id, place: 'tree' })
  }

  const editGift = (gift: Gift, fromList = false) => setDialog({ heading: 'Change this gift', gift, fromList })

  const linkTo = (link?: string) =>
    link && (
      <a href={link} target="_blank" rel="noreferrer">
        {storeFromLink(link) ?? 'Open link'}
      </a>
    )

  // Shipping shows right after the name.
  const shipNote = (gift: Gift) => gift.shipTo && <TitleNote>to {houseOf(gift.shipTo)}</TitleNote>

  // A gift's notes are the family's, so they say whose they are.
  const familyNote = (gift: Gift) => gift.notes && `${nameOf(gift.giverId)}: ${gift.notes}`

  // Who's getting it. Your own gifts can be changed (or undone) right here.
  const giver = (gift: Gift, fromList = false) =>
    gift.giverId === viewer.id ? (
      <>
        You
        <Button variant="quiet" onClick={() => editGift(gift, fromList)} aria-label={`Change ${gift.title}`}>
          Change
        </Button>
      </>
    ) : (
      nameOf(gift.giverId)
    )

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
        <SnowGlobe size={88} scene={person.globeScene} gifts={gifts.length} label={`${person.name}'s snow globe, with gifts piling up`} />
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
              const wishNotes = <NoteLine parts={[wish.notes, linkTo(wish.link)]} />

              if (wish.kind === 'maybe') {
                // Several people can each add a gift under an idea.
                const addUnder = () => setDialog({ heading: `A gift for "${wish.title}"`, wishItemId: wish.id })
                return (
                  <Row
                    key={wish.id}
                    status={<StatusPill status={under.length ? 'covered' : 'open'} />}
                    title={wishTitle(wish)}
                    notes={wishNotes}
                    aside={under.length === 0 && <Button onClick={addUnder}>Add a gift</Button>}
                  >
                    {under.length > 0 && (
                      <ul className={styles.underIdea}>
                        {under.map((gift) => (
                          <li key={gift.id} className={styles.underIdeaGift}>
                            <div className={styles.underIdeaText}>
                              <span className={styles.underIdeaTitle}>
                                {gift.title}
                                {shipNote(gift)}
                              </span>
                              <NoteLine parts={[familyNote(gift), linkTo(gift.link)]} />
                            </div>
                            <span className={styles.underIdeaWho}>{giver(gift)}</span>
                          </li>
                        ))}
                        <li>
                          <Button variant="quiet" className={styles.addAnother} onClick={addUnder}>
                            Add another gift
                          </Button>
                        </li>
                      </ul>
                    )}
                  </Row>
                )
              }

              const gift = under[0]
              return (
                <Row
                  key={wish.id}
                  status={<StatusPill status={gift ? 'covered' : 'open'} />}
                  title={
                    <>
                      {wishTitle(wish)}
                      {gift && shipNote(gift)}
                    </>
                  }
                  notes={
                    <>
                      {wishNotes}
                      {gift && <NoteLine parts={[familyNote(gift), linkTo(gift.link)]} />}
                    </>
                  }
                  aside={gift ? giver(gift, true) : <Button onClick={() => claim(wish)}>{coverLabel}</Button>}
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
                title={
                  <>
                    {gift.title}
                    {gift.place === 'stocking' && <TitleNote>stocking</TitleNote>}
                    {shipNote(gift)}
                  </>
                }
                notes={<NoteLine parts={[familyNote(gift), linkTo(gift.link)]} />}
                aside={giver(gift)}
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
