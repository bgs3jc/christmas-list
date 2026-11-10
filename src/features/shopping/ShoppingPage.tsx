import { useState } from 'react'
import { addGift, markIdeaGifted, useHomes, usePeople, useShopping, useViewer, type Gift, type WishItem } from '../../data'
import { coverLabel, storeFromLink } from '../../shared/format'
import { LockIcon, StarIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { Shelf } from '../../shared/ui/Shelf'
import { StatusPill } from '../../shared/StatusPill'
import { Button } from '../../shared/ui/Button'
import { EmptyRow, ListSection, NoteLine, Row, Rows, TitleNote } from '../../shared/ui/List'
import { GiftDialog, type GiftDialogSetup } from './GiftDialog'
import { Overheard } from './Overheard'
import styles from './Shopping.module.css'


// The "Change" button on a wish you're getting, so focus can find it.
const changeId = (wishId: string) => `change-${wishId}`

const santaCount = (n: number) => ['Two', 'Three', 'Four'][n - 2] ?? String(n)

export function ShoppingPage({ recipientId }: { recipientId: string }) {
  const view = useShopping(recipientId)
  const viewer = useViewer()
  const people = usePeople()
  const homes = useHomes()
  const [dialog, setDialog] = useState<GiftDialogSetup | null>(null)

  if (!view) {
    return (
      <main className={styles.missing}>
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
    // The button just pressed is gone. Keep keyboard focus in the row, on its new "Change".
    requestAnimationFrame(() => document.getElementById(changeId(wish.id))?.focus())
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

  // On a list row, a gift's notes say whose they are, so they aren't taken
  // for the wisher's own note above them.
  const familyNote = (gift: Gift) =>
    gift.notes && `${gift.giverId === viewer.id ? 'Your' : `${nameOf(gift.giverId)}'s`} note: ${gift.notes}`

  // Who's getting it. Your own gifts can be changed (or undone) right here.
  // `focusHere` marks the Change button that I'll be Santa moves focus to.
  const giver = (gift: Gift, fromList = false, focusHere = fromList) =>
    gift.giverId === viewer.id ? (
      <>
        You
        <Button
          variant="quiet"
          id={focusHere && gift.wishItemId ? changeId(gift.wishItemId) : undefined}
          onClick={() => editGift(gift, fromList)}
          aria-label={`Change ${gift.title}`}
        >
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
    <Shelf
      follow
      aside={
        <>
          <SnowGlobe size={260} scene={person.globeScene} gifts={gifts.length} label={`${person.name}'s snow globe, with gifts piling up`} />
          <div>
            <h1 className={styles.name}>Shopping for {person.name}</h1>
            <p className={styles.private}>
              <LockIcon />
              {person.name} can't see this page
            </p>
          </div>
        </>
      }
    >

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

              // Usually one gift. Two people can claim the same wish at once;
              // then every Santa shows, so they can sort it out.
              const gift = under[0]
              const shipsTo = [...new Set(under.map((g) => g.shipTo).filter(Boolean))]
              return (
                <Row
                  key={wish.id}
                  status={<StatusPill status={gift ? 'covered' : 'open'} />}
                  title={
                    <>
                      {wishTitle(wish)}
                      {shipsTo.map((home) => (
                        <TitleNote key={home}>to {houseOf(home!)}</TitleNote>
                      ))}
                    </>
                  }
                  notes={
                    <>
                      {wishNotes}
                      {under.map((g) => (
                        <NoteLine key={g.id} parts={[familyNote(g), linkTo(g.link)]} />
                      ))}
                      {under.length > 1 && (
                        <NoteLine parts={[`${santaCount(under.length)} Santas on this one. One of you can tap Change, then Not getting it.`]} />
                      )}
                    </>
                  }
                  aside={
                    !gift ? (
                      <Button onClick={() => claim(wish)}>{coverLabel}</Button>
                    ) : under.length === 1 ? (
                      giver(gift, true)
                    ) : (
                      <span className={styles.givers}>
                        {under.map((g, i) => (
                          <span key={g.id} className={styles.underIdeaWho}>
                            {giver(g, true, i === 0)}
                          </span>
                        ))}
                      </span>
                    )
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
                title={
                  <>
                    {gift.title}
                    {gift.place === 'stocking' && <TitleNote>stocking</TitleNote>}
                    {shipNote(gift)}
                  </>
                }
                notes={<NoteLine parts={[gift.notes, linkTo(gift.link)]} />}
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
        // The note becomes the gift's note, and leaves Overheard once it's a gift.
        onMakeGift={(idea) => setDialog({ heading: `Add a gift for ${person.name}`, notes: idea.text, onSaved: () => markIdeaGifted(idea.id) })}
      />

      {dialog && <GiftDialog
          setup={dialog}
          recipient={person}
          others={others}
          homes={homes.filter((h) => h.id !== person.homeId)}
          viewer={viewer}
          onClose={() => setDialog(null)}
        />}
    </Shelf>
  )
}
