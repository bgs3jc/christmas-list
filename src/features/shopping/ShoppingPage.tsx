import { useEffect, useState } from 'react'
import { features } from '../../config/features'
import {
  addGift,
  markIdeaGifted,
  markSeen,
  setSantasList,
  usePeople,
  useShopping,
  useViewer,
  type Gift,
  type SantasListStatus,
  type WishItem,
} from '../../data'
import { plural, santasListLabels, shortDate, wishDetails } from '../../shared/format'
import { LockIcon, StarIcon } from '../../shared/icons'
import { SnowGlobe } from '../../shared/SnowGlobe'
import { StatusMark } from '../../shared/StatusMark'
import { Button } from '../../shared/ui/Button'
import list from '../../shared/ui/List.module.css'
import { GiftDialog, type GiftDialogSetup } from './GiftDialog'
import { IdeasPanel } from './IdeasPanel'
import styles from './Shopping.module.css'

export function ShoppingPage({ recipientId }: { recipientId: string }) {
  const view = useShopping(recipientId)
  const viewer = useViewer()
  const people = usePeople()
  // Remember when you last looked before this visit counts as looking.
  const [since] = useState(() => view?.lastSeen)
  const [dialog, setDialog] = useState<GiftDialogSetup | null>(null)

  useEffect(() => {
    markSeen(recipientId)
  }, [recipientId])

  if (!view) {
    return (
      <main className={styles.page}>
        <p>There's nobody here by that name.</p>
      </main>
    )
  }

  const { person, wishes, gifts, ideas } = view
  const nameOf = (id: string) => (id === viewer.id ? 'You' : (people.find((p) => p.id === id)?.name ?? 'Someone'))
  const givers = people.filter((p) => p.id !== person.id)

  const giftsByWish = new Map<string, Gift[]>()
  for (const gift of gifts) {
    if (gift.wishItemId) giftsByWish.set(gift.wishItemId, [...(giftsByWish.get(gift.wishItemId) ?? []), gift])
  }
  const wishIds = new Set(wishes.map((w) => w.id))
  const specific = wishes.filter((w) => w.kind === 'specific')
  const open = specific.filter((w) => !giftsByWish.has(w.id))
  const taken = specific.filter((w) => giftsByWish.has(w.id))
  const hints = wishes.filter((w) => w.kind === 'maybe')
  // Surprises, plus anything whose list item was since removed.
  const offList = gifts.filter((g) => !g.wishItemId || !wishIds.has(g.wishItemId))
  const isNew = (w: WishItem) => Boolean(since && w.createdAt > since)

  function claim(wish: WishItem) {
    addGift({
      recipientId: person.id,
      giverId: viewer.id,
      title: wish.title,
      wishItemId: wish.id,
      price: wish.price,
      status: 'planned',
      place: 'tree',
    })
  }

  const editGift = (gift: Gift, fromList = false) => setDialog({ heading: 'Change this gift', gift, fromList })

  const counts = (['wrapped', 'bought', 'planned'] as const)
    .map((status) => [status, gifts.filter((g) => g.status === status).length] as const)
    .filter(([, n]) => n > 0)
    .map(([status, n]) => `${n} ${status}`)

  return (
    <main className={styles.page}>
      <aside className={styles.aside}>
        <SnowGlobe gifts={gifts.map((g) => g.status)} label={`${person.name}'s snow globe, with ${plural(gifts.length, 'gift')} at the bottom`} />
        <h1 className={styles.name}>{person.name}</h1>
        <p className={styles.counts}>{gifts.length ? `${plural(gifts.length, 'gift')} so far: ${counts.join(', ')}.` : 'No gifts planned yet.'}</p>
        <p className={styles.private}>
          <LockIcon />
          {person.name} can't see this page
        </p>

        {features.santasList && (
          <div className={styles.santa}>
            <label htmlFor="santas-list" className={styles.santaLabel}>
              Santa's list
            </label>
            <select
              id="santas-list"
              className={styles.santaSelect}
              value={person.santasList?.status ?? ''}
              onChange={(e) => setSantasList(person.id, e.target.value as SantasListStatus)}
            >
              {!person.santasList && (
                <option value="" disabled>
                  Pick one
                </option>
              )}
              {Object.entries(santasListLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {person.santasList && <span className={styles.santaBy}>Set by {nameOf(person.santasList.setBy)}</span>}
          </div>
        )}

        <IdeasPanel
          person={person}
          ideas={ideas}
          nameOf={nameOf}
          onMakeGift={(idea) =>
            setDialog({ heading: `Add a gift for ${person.name}`, title: idea.text, onSaved: () => markIdeaGifted(idea.id) })
          }
        />
      </aside>

      <div className={styles.main}>
        {since && <SinceLine since={since} personName={person.name} newCount={wishes.filter(isNew).length} changes={gifts.filter((g) => g.updatedAt > since && g.updatedBy !== viewer.id)} nameOf={nameOf} />}

        <section aria-labelledby="open-heading" className={list.section}>
          <div className={list.sectionHead}>
            <h2 id="open-heading" className={list.sectionTitle}>
              Still open
            </h2>
            <span className={list.sectionCount}>{plural(open.length, 'thing')} from {person.name}'s list</span>
          </div>
          {open.length === 0 ? (
            <p className={list.empty}>Everything specific on {person.name}'s list is spoken for.</p>
          ) : (
            <ul className={list.rows}>
              {open.map((wish) => (
                <li key={wish.id} className={list.row}>
                  <WishSummary wish={wish} isNew={isNew(wish)} />
                  <div className={list.actions}>
                    <Button onClick={() => claim(wish)}>I'll get it</Button>
                    <Button
                      variant="quiet"
                      onClick={() => setDialog({ heading: 'Someone else is getting it', title: wish.title, wishItemId: wish.id, price: wish.price, fromList: true })}
                    >
                      Someone else
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {hints.length > 0 && (
          <section aria-labelledby="hints-heading" className={list.section}>
            <div className={list.sectionHead}>
              <h2 id="hints-heading" className={list.sectionTitle}>
                {person.name}'s hints
              </h2>
              <span className={list.sectionCount}>A store, brand or kind of thing. Several gifts can go under each.</span>
            </div>
            <ul className={list.rows}>
              {hints.map((wish) => {
                const under = giftsByWish.get(wish.id) ?? []
                return (
                  <li key={wish.id} className={`${list.row} ${styles.hintRow}`}>
                    <div className={list.rowMain}>
                      <WishSummary wish={wish} isNew={isNew(wish)} bare />
                      {under.length > 0 && (
                        <ul className={styles.underHint}>
                          {under.map((gift) => (
                            <li key={gift.id} className={styles.underHintGift}>
                              <span className={styles.underHintTitle}>
                                {gift.title} {gift.price && <span className={styles.price}>{gift.price}</span>}
                              </span>
                              <GiftOwner gift={gift} nameOf={nameOf} onChange={() => editGift(gift)} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className={list.actions}>
                      <Button onClick={() => setDialog({ heading: `A gift for "${wish.title}"`, wishItemId: wish.id })}>Add a gift for this</Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby="taken-heading" className={list.section}>
          <div className={list.sectionHead}>
            <h2 id="taken-heading" className={list.sectionTitle}>
              Taken care of
            </h2>
            <span className={list.sectionCount}>{plural(taken.length, 'thing')} from {person.name}'s list</span>
          </div>
          {taken.length === 0 ? (
            <p className={list.empty}>Nobody has claimed anything yet.</p>
          ) : (
            <ul className={list.rows}>
              {taken.map((wish) => {
                const gift = giftsByWish.get(wish.id)![0]
                return (
                  <li key={wish.id} className={list.row}>
                    <WishSummary wish={wish} />
                    <GiftOwner gift={gift} nameOf={nameOf} onChange={() => editGift(gift, true)} />
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="off-heading" className={list.section}>
          <div className={list.sectionHead}>
            <h2 id="off-heading" className={list.sectionTitle}>
              Not on {person.name}'s list
            </h2>
            <span className={list.sectionCount}>Surprises and stocking stuffers</span>
          </div>
          {offList.length > 0 && (
            <ul className={list.rows}>
              {offList.map((gift) => (
                <li key={gift.id} className={list.row}>
                  <div className={list.rowMain}>
                    <span className={list.title}>{gift.title}</span>
                    <p className={list.details}>
                      {[gift.price, gift.place === 'stocking' ? 'Stocking' : 'Under the tree', gift.notes].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <GiftOwner gift={gift} nameOf={nameOf} onChange={() => editGift(gift)} />
                </li>
              ))}
            </ul>
          )}
          <div className={styles.addGift}>
            <Button variant="main" onClick={() => setDialog({ heading: `Add a gift for ${person.name}` })}>
              Add a gift for {person.name}
            </Button>
          </div>
        </section>
      </div>

      {dialog && <GiftDialog setup={dialog} recipient={person} givers={givers} viewerId={viewer.id} onClose={() => setDialog(null)} />}
    </main>
  )
}

function WishSummary({ wish, isNew = false, bare = false }: { wish: WishItem; isNew?: boolean; bare?: boolean }) {
  const details = wishDetails(wish)
  const content = (
    <>
      <div className={list.titleLine}>
        {wish.kind === 'maybe' && <span className={list.maybeTag}>Maybe</span>}
        {wish.link ? (
          <a href={wish.link} target="_blank" rel="noreferrer" className={list.title}>
            {wish.title}
          </a>
        ) : (
          <span className={list.title}>{wish.title}</span>
        )}
        {wish.topPick && (
          <span className={list.topPick}>
            <StarIcon filled size={16} />
            Top pick
          </span>
        )}
        {isNew && <span className={list.newMark}>New</span>}
      </div>
      {details && <p className={list.details}>{details}</p>}
    </>
  )
  return bare ? content : <div className={list.rowMain}>{content}</div>
}

function GiftOwner({ gift, nameOf, onChange }: { gift: Gift; nameOf: (id: string) => string; onChange: () => void }) {
  return (
    <div className={list.actions}>
      <span className={styles.giver}>{nameOf(gift.giverId)}</span>
      <StatusMark status={gift.status} />
      <Button variant="quiet" onClick={onChange} aria-label={`Change ${gift.title}`}>
        Change
      </Button>
    </div>
  )
}

interface SinceLineProps {
  since: string
  personName: string
  newCount: number
  changes: Gift[]
  nameOf: (id: string) => string
}

// What happened since you last looked: new wishes, and gifts others planned or bought.
function SinceLine({ since, personName, newCount, changes, nameOf }: SinceLineProps) {
  const parts: string[] = []
  if (newCount) parts.push(`${personName} added ${plural(newCount, 'thing')}`)
  for (const gift of changes.slice(0, 3)) {
    const who = nameOf(gift.updatedBy)
    if (gift.updatedBy !== gift.giverId) {
      const giver = nameOf(gift.giverId)
      parts.push(`${who} put ${giver === 'You' ? 'you' : giver} down for ${gift.title}`)
    } else if (gift.status === 'planned') {
      parts.push(`${who} is getting ${gift.title}`)
    } else {
      parts.push(`${who} ${gift.status} ${gift.title}`)
    }
  }
  if (changes.length > 3) parts.push(`${changes.length - 3} more changes`)

  return (
    <p className={styles.since}>
      {parts.length ? (
        <>
          <span className={list.newMark}>New</span>
          <span>
            Since you last looked on {shortDate(since)}: {parts.join(' · ')}.
          </span>
        </>
      ) : (
        <span className={styles.sinceQuiet}>Nothing new since you last looked on {shortDate(since)}.</span>
      )}
    </p>
  )
}
